# Just
A convenient tool for fast prototyping of web and mobile applications.

## Inspiration

https://www.youtube.com/watch?v=-_qMagfZtv8

## Use Cases

- You want to create a prototype of an application in JS/HTML, but you don't want to invest time in the server-side. Just is simple and just works. 1 min to deploy to your own server or without a server (SAAS version will be available soon).
- You don't want to learn syntax of Firebase. Just uses pure Mongo API (find, aggregate, map/reduce, update, ...) for **manipulating data on the Client Side**. Security included. Plus some convenient additions likr authotization are available.
- You want to have a history of your data (use Snapshots API).
- You want to move easily from a prototype to a production version.
- You don't want to be locked-in by vendor (like Firebase). You can install Just on your own server. Or if you want to change a framework, just take a Mongo code and implement it in your way.
- You want to use a simple, convenient and powerful admin interface.

## Features

- pure Mongo API from Client Side
- security-enabled (templates of allowed requests in a production version)
- auth API, multi-user support
- multiple sites support per one Just instance
- primitive graph API
- data change events (over web sockets)
- extendable on each level by Plugins (auth additional checks, data manipulation checks, additional API commands, ...)
- really simple data model, forget about async issues in most of cases
- simple but powerful admin interface
- Angular(1) integration library (with extremely simple API)
- installation on your own server with Docker (or without)

Future features: full-featured SQL API from client-side, generators of testing data, filestorage, data exchange/client-side orchestration framework for complex distributed applications (games, chats, ...), SAAS version

## Terminology

**Site** - we use this term to denote the name of your service that will use Just. Each **site** has it's own settings, users, etc.
Technically the site is a record in the database in `_sites` collection.
There are several collections that correspond to the site: `site-{site-name}`, `site-{site-name}-users`, `site-{site-name}-snapshots`.

## Installation

Install a Docker container on your server. By default there will be created a site with the name `default`.

```
$ docker run -d -it --restart=always --name=just \
 -v /var/lib/just/mongodb:/var/lib/mongodb \
 -p 8080:80 extremeprog/just:latest
```
Include a script to your application page:
```html
<script src='http://domain.site.com/just.extremeprog.js?site=default'></script>
```

## Just Admin Interface for Mongo Data
We provide you with the most convenient and handy mongo admin panel where you can view and manage your data.
The interface is fully configurable and customizable with Plugins. The interface is available at the port and domain name of you server.

Use admin@just.extremeprog.com/admin credentials to login and view data as an admin user.

## Get and write data examples

#### Get data
```
just.mgoInterface.find({_type: 'Fruit'})
```

#### Write data
```
just.mgoInterface.save({_type: 'Fruit', name: 'Banana'})
```


## Further steps
Read our [API documentation](https://extremeprog-com.github.io/just/auth).
