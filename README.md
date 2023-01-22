<img src='https://bettercodehub.com/edge/badge/cmusv-fse/s22-ESN-SB1?branch=main&token=339dfd8b021291cef247279062d25aee92398200'>

Environment setup
1. make sure you have npm
2. run: npm install
3. run: npm start
4. go to Chrome and enter: http://localhost:8000

Database setup
1. make sure you local has mongodb-community@4.4
2. tostart run: brew services run mongodb-community
3. tostop run: brew services stop mongodb-community
4. toview run: brew services list

GUI tool to mongodb
1. mongodb compass

Altas
1. compass connection: mongodb+srv://fse-s22-esn-sb1:<password>@cluster0.jya2l.mongodb.net/test
2. replace <password> to real password
3. switch mongodbEndpoint in database.js

Jest
1. install yarn
2. run: yarn test
3. substitute but not recommeded: npm test

YOU ARE *NOT* PERMITTED TO SHARE THIS REPO OUTSIDE THIS GITHUB ORG. YOU ARE *NOT* PERMITTED TO FORK THIS REPO UNDER ANY CIRCUMSTANCES. YOU ARE *NOT* PERMITTED TO CREATE ANY PUBLIC REPOS INSIDE THE CMUSV-FSE ORGANIZATION.  YOU SHOULD HAVE LINKS FROM THIS README FILE TO YOUR PROJECT DOCUMENTS, SUCH AS YOUR REST API SPECS AND YOUR ARCHITECTURE DOCUMENT. *IMPORTANT*: MAKE SURE TO CHECK AND UPDATE YOUR LOCAL GIT CONFIGURATION IN ORDER TO MATCH YOUR LOCAL GIT CREDENTIALS TO YOUR SE-PROJECT GITHUB CREDENTIALS (COMMIT USING THE SAME EMAIL ASSOCIATED WITH YOUR GITHUB ACCOUNT): OTHERWISE YOUR COMMITS WILL NOT BE INCLUDED IN GITHUB STATISTICS AND REPO AUDITS WILL UNDERESTIMATE YOUR CONTRIBUTION. 
