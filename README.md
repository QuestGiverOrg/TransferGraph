# Overview

TransferGraph is small node.js project to transfer data from one GraphQL instance to another.

You must have already migrated your schema to the new GraphQL instance before this will work.

**THIS WILL CLOBBER DATA IN THE TARGET GRAPHQL INSTANCE**

If you need to try this again if you get it wrong and forgien key constraints are giving you issues, you'll need to manually delete the data from your target graph first.

If your database is complicated, or if you need this to be idempotent, feel free to reimplement main.js with manual calls to `transferTableData()`

There's an improvement here for some databases that could probably address idempotency (by reverse clearing the data before transfering) but that hasn't been implmented yet.

# Instructions

1. back up your data by exporting a .json from every table in the hasura console
1. run `npm install`
1. fill out the `.env-example`
    1. Be VERY careful about getting this right
    1. Don't mix up the servers, you could destroy your old data
    1. Don't commit this file, you could leak your admin secrets
1. rename `.env-example` to `.env`
1. fill out the `transfer-example.json` while ensuring it is in the right order for your database
1. rename `transfer-example.json` to `transfer.json`
1. run `npm run transfer`
