const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const request = require('request-promise');
const session = require('express-session');
const query_string = require('querystring');

// loading env vars from .env file
require('dotenv').config();

const nonceCookie = 'auth0rization-nonce';
let oidcProviderInfo;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(16).toString('hex')));
app.use(
  session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false
  })
);
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

function validateIDToken(idToken, nonce) {
  const decodedToken = jwt.decode(idToken);
  // fetch ID token details
  const {
    nonce: decodedNonce,
    aud: audience,
    exp: expirationDate,
    iss: issuer
  } = decodedToken;

  const currentTime = Math.floor(Date.now() / 1000);
  const expectedAudience = process.env.CLIENT_ID;

  // validate ID tokens
  if (
    audience !== expectedAudience ||
    decodedNonce !== nonce ||
    expirationDate < currentTime ||
    issuer !== oidcProviderInfo['issuer']
  )
    throw Error();
  // return the decoded token
  return decodedToken;
}

var email = "rukaiyaazmi@gmail.com";
var random = Math.random().toString();
const cID = crypto.createHash('sha256').update(email+random).digest();

function base64URLEncode(str) {
  return str.toString('base64')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .replace(/=/g, '');
}

const clientID = base64URLEncode(cID);
console.log("client ID:" , clientID)

const id = "RayHuszkvmbHDUKRsThanRd2s66gOJwpjKUlCqOCyM"
if(id === clientID){
    console.log("matched")
}else{
    console.log("not matched")
}

const secret = base64URLEncode(crypto.randomBytes(32));

const bcrypt = require("bcrypt")
const saltRounds = 10

bcrypt.genSalt(saltRounds).then(salt => {
  return bcrypt.hash(secret, salt)
  }).then(hash => {
    console.log('client secret:', hash)
  })

// const s = "$2b$10$9KeuhfaxlGox6ZcQJg.1fuSryZKboZwkBuIXW8LMH9tGhZr7gm75q"
// const isMatched = bcrypt.compare(hash, s);

var verifier = base64URLEncode(crypto.randomBytes(32));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}
var challenge = base64URLEncode(sha256(verifier));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  const { idToken, decodedIdToken } = req.session;

  const logoutUrl = `https://${
    process.env.OIDC_PROVIDER
  }/v2/logout?${query_string.stringify({
    returnTo: 'http://localhost:3000/logout'
  })}`;

  res.render('profile', {
    idToken,
    decodedIdToken,
    logoutUrl
  });
});

app.get('/login', (req, res) => {
  const authorizationEndpoint = oidcProviderInfo['authorization_endpoint'];
  const responseType = 'code';
  const scope = 'openid email profile read:to-dos';
  const clientID = process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:3000/callback';
  const responseMode = 'query';
  const nonce = crypto.randomBytes(16).toString('hex');
  const audience = process.env.API_IDENTIFIER;
  const code_challenge = challenge;
  const code_verifier = verifier;

  const options = {
    maxAge: 1000 * 60 * 15,
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
  };

  const authURL = `${authorizationEndpoint}?${query_string.stringify({
    response_mode: responseMode,
    response_type: responseType,
    scope: scope,
    client_id: clientID,
    redirect_uri: redirectUri,
    nonce: nonce,
    audience: audience
  })}`;

  //console.log(authURL);

  res.cookie(nonceCookie, nonce, options).redirect(authURL);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const codeExchangeOptions = {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    //client_secret: process.env.CLIENT_SECRET,
    code: code,
    code_challenge: challenge,
    code_verifier: verifier,
    redirect_uri: 'http://localhost:3000/callback'
  };

  const codeExchangeResponse = await request.post(
    `https://${process.env.OIDC_PROVIDER}/oauth/token`,
    { form: codeExchangeOptions }
  );

  const tokens = JSON.parse(codeExchangeResponse);

  req.session.accessToken = tokens.access_token;
console.log(req.session)
  // extract nonce from cookie
  const nonce = req.signedCookies[nonceCookie];
  delete req.signedCookies[nonceCookie];

  try {
    req.session.decodedIdToken = validateIDToken(tokens.id_token, nonce);
    req.session.idToken = tokens.id_token;
    res.redirect('/profile');
  } catch (error) {
    res.status(401).send();
  }
});

app.get('/to-dos', async (req, res) => {
  const delegatedRequestOptions = {
    url: 'http://localhost:3001',
    headers: {
      Authorization: `Bearer ${req.session.accessToken}`
    }
  };

  try {
    const delegatedResponse = await request(delegatedRequestOptions);
    const toDos = JSON.parse(delegatedResponse);

    res.render('to-dos', {
      toDos
    });
  } catch (error) {
    res.status(error.statusCode).send(error);
  }
});

app.get('/logout', async (req, res) => {
  //console.log('Logout called');
  req.session.destroy();
  res.redirect('/');
});

app.get('/remove-to-do/:id', async (req, res) => {
  res.status(501).send();
});

const { OIDC_PROVIDER } = process.env;
const discEnd = `https://${OIDC_PROVIDER}/.well-known/openid-configuration`;
//console.log(discEnd)
request(discEnd)
  .then(res => {
    oidcProviderInfo = JSON.parse(res);
    //console.log(oidcProviderInfo);
    app.listen(3000, () => {
      //console.log(`Server running on http://localhost:3000`);
    });
  })
  .catch(error => {
    //console.error(error);
    //console.error(`Unable to get OIDC endpoints for ${OIDC_PROVIDER}`);
    process.exit(1);
  });
