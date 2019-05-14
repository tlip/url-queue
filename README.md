# url-queue

An service that creates a job queue to fetch HTML from URLs. It caches recent jobs and their responses for 60 seconds using Redis and stores the results persistently in a database using [TypeORM](https://github.com/typeorm/typeorm/). This service should be able to be scaled up across multiple instances in a cluster or a processor using PM2.


## Getting Started
* Make sure you have _at least_ `node v10.13.0-v11.x.x` (node 12 is not yet supported) and `yarn v1.13.0+` installed (npm at your own risk).
* Make sure you have both Redis and a relational database installed locally and running.
* Clone the repo
```sh
$ git clone https://github.com/flamingYawn/url-queue.git
$ cd url-queue
```
* Install dependencies
```sh
$ yarn
```
* Install `ts-node` and `typeorm` globally
```sh
$ yarn global add ts-node typeorm
```
* Create a new database named `url_queue` in whatever RDB you're using.
* Replace the example environment variables in `.env`.
* Start the server for the first time
```sh
$ yarn start
```
* Once you start, `yarn start` should set up the database with the correct table.

And then you should be good to go.


## Usage
To start a url-fetching job, go to
```
/api/v1/url/www.google.com
```
> Note: The url cannot have any `/s` in it, so only root URLs will work

The response should look something like this:
```json
{
    "id": "a23ada507b8f957270ec9f9782f1818a"
}
```

Then, take that `id` and go to
```
/api/v1/result/a23ada507b8f957270ec9f9782f1818a
```
And it should serve the page you requested (sans subsequent calls for images/scripts/etc.)
