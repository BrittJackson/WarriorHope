FROM node:latest
ENV PORT=3000
ENV IDmeDatabase='IDmeDatabase'
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install 
## Commenting this out as the local directory will be mapped by volume
#COPY . .
