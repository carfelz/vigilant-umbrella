import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignInDto, SignUpDto } from 'src/auth/dto';
import { EditUserDto } from 'src/users/dto';

const mockData = {
  signIn: {
    email: 'test@mail.com',
    password: '123456789',
  },
  signUp: {
    email: 'test@mail.com',
    password: '123456789',
    firstName: 'John',
    lastName: 'Doe',
  },
  edit: {
    email: 'test@mail.com',
    firstName: 'John',
    lastName: 'Doe',
  },
};

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
      signUpData = mockData.signUp;
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

      it('Thows error no Body passed', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });
    describe('Signin', () => {
      beforeEach(() => {
        signInData = mockData.signIn;
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
      customMock = { ...mockData.edit };
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
    describe('Create bookmark', () => {
      it('Should create a bookmark', () => {});
      it('Should throw an error if no body passed', () => {});
      it('SHould throw an error if user not authenticated', () => {});
    });
    describe('Get bookmarks', () => {});
    describe('Get bookmark by ID', () => {});
    describe('Update bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
