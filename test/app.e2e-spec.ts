import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignInDto, SignUpDto } from 'src/auth/dto';
import { EditUserDto } from 'src/users/dto';
import { userModuleData, bookmarkModuleData } from './testData';
import { CreateBookmarkDto } from 'src/bookmarks/dto/create-bookmark.dto';

let app: INestApplication;
let prisma: PrismaService;
let signInData: SignInDto;
let signUpData: SignUpDto;

describe('App e2e', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    app.init();
    app.listen('3333');

    prisma = app.get(PrismaService);
    await prisma.clearDB();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    beforeAll(() => {
      signUpData = userModuleData.signUp;
    });
    describe('Signup', () => {
      it('Creates a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signUpData)
          .expectStatus(201)
          .expectBodyContains('access_token');
      });

      it('Thows error if no email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...signUpData,
            email: '',
          })
          .expectStatus(400);
      });

      it('Thows error if no password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...signUpData,
            password: '',
          })
          .expectStatus(400);
      });

      it('Thows error if password less than 8 charts', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...signUpData,
            password: '123',
          })
          .expectStatus(400);
      });

      it('Throws error error if email is already in use', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signUpData)
          .expectStatus(403);
      });

      it('Thows error no Body passed', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });
    describe('Signin', () => {
      beforeEach(() => {
        signInData = userModuleData.signIn;
      });

      it('Thows an error is no Body passed', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('Should returns jwt access token if login successes', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signInData)
          .expectStatus(200)
          .expectBodyContains('access_token')
          .stores((resquest, response) => {
            return {
              userAt: response.body.access_token,
            };
          });
      });

      it('Thows an error is no email passed', () => {
        signInData.password = '';
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signInData)
          .expectStatus(400);
      });

      it('Thows an error is no password passed', () => {
        signInData.email = '';
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signInData)
          .expectStatus(400);
      });
    });
  });

  describe('Users', () => {
    let customMock: EditUserDto;

    beforeEach(() => {
      customMock = { ...userModuleData.edit };
    });
    describe('Get me', () => {
      it('Should return a user with a given access_token', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLike(customMock);
      });

      it('Should return unauthorized if jwt not in headers', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });
    describe('Edit user', () => {
      it('Should update a user', () => {
        return pactum
          .spec()
          .put('/users/edit')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            firstName: 'Jhonny',
          })
          .expectStatus(200)
          .expectJsonLike({
            ...customMock,
            firstName: 'Jhonny',
          });
      });

      it('Should not update the user if no jwt', () => {
        return pactum
          .spec()
          .put('/users/edit')
          .withBody({
            firstName: 'Jhonny',
          })
          .expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    let customMock: CreateBookmarkDto;
    describe('Create bookmark', () => {
      beforeEach(() => {
        customMock = { ...bookmarkModuleData.createBookmark };
      });
      it('Should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(customMock)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .expectJsonLike({
            ...customMock,
          })
          .stores((resquest, response) => {
            return {
              bookmarkId: response.body.id,
            };
          });
      });
      it('SHould throw an error if title exists', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(customMock)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403);
      });
      it('Should throw an error if no body passed', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(customMock)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403);
      });
      it('Should throw an error if user not authenticated', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(customMock)
          .expectStatus(401);
      });
    });
    describe('Get bookmarks', () => {
      it('Should return all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLike([
            {
              ...customMock,
            },
          ]);
      });

      it('Should throw error if user not authenticated', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });
    describe('Get bookmark by ID', () => {
      it('Should return a bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLike({
            ...customMock,
          });
      });
      it('Should throw error if user not authenticated', () => {
        return pactum.spec().get('/bookmarks/$S{bookmarkId}').expectStatus(401);
      });
      it('Should throw error if bookmark not found', () => {
        return pactum
          .spec()
          .get('/bookmarks/ujjuu4u5ju445')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(404)
          .inspect();
      });
    });
  });
});
