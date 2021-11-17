FROM node:latest
#ENV NODE_ENV=production
#
#### Environmental Variables ####
#
# Where WarriorHope's database is locatioed
ENV WH_DATABASE='database'
# Port at which web app is accessed
ENV PORT=3000
#
# IDme Configuration
#
ENV IDME_CLIENT_ID=''
ENV IDME_CLIENT_SECRET=''
ENV IDME_CLIENT_AUTH_ENDPOINT='https://api.id.me/oauth/authorize'
ENV IDME_CLIENT_TOKEN_ENDPOINT='https://api.id.me/oauth/token'
ENV SIMULATED_IDME_CLIENT_ID='WarriorHope'
ENV SIMULATED_IDME_CLIENT_SECRET='123abc'
ENV SIMULATED_IDME_AUTH_ENDPOINT='http://411crystal.cpi.cs.odu.edu:3333/oauth/authorize/'
ENV SIMULATED_IDME_TOKEN_ENDPOINT='http://simulatedIDme:3000/oauth/token/'

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install && npm install -g nodemon
## Copy line commented out as the directory will be mapped as a docker volume
#COPY . .
