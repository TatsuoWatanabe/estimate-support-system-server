@ECHO OFF
REM receive the parameter
SET env=%1
REM set your mongodb uri string.
SET MONGODB_URI=mongodb://localhost:27017/estimate-support-system-db
REM set your set your super secret words.
SET SUPER_SECRET=set-your-super-secret-words
REM set your client host application url.
SET ALLOW_ORIGIN=http://localhost:3000

IF "%env%"=="prod" (
  echo "npm start"
  REM execute package.json script.start
  SET NODE_ENV=production
  node app/bin/www.js
) ELSE IF "%env%"=="dev" (
  echo "npm run start_dev"
  REM execute package.json script.start_dev
  SET NODE_ENV=development
  node node_modules\supervisor\lib\cli-wrapper.js -i package.json,node_modules -e node,js,json app/bin/www.js
) ELSE (
  echo "set parameter 'dev' or 'prod'"
)
