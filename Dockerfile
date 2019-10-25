# Compiles webpack and typescript
FROM node:10 as BUILD
WORKDIR /tmp/app
COPY . .
RUN npm i --no-optional
ENV NODE_ENV=production
RUN npm run build

# Deploy final app
FROM node:10
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3478
WORKDIR /usr/src/app
COPY --from=BUILD /tmp/app/package*.json /usr/src/app/
COPY --from=BUILD /tmp/app/build/ /usr/src/app/build
COPY --from=BUILD /tmp/app/index.html /usr/src/app/
RUN npm ci
EXPOSE $PORT
CMD [ "npm", "start" ]