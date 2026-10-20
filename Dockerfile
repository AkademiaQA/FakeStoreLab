FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node design/design/tokens.css ./design/design/tokens.css
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]
