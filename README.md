# mongo-sites-api
A convenient tool for fast prototyping of web and mobile applications.

## Installation

Intall a Docker container on your server.

```
$ docker run -d -it --restart=always --name=msa \
 -v /var/lib/mongo-sites-api/mongodb:/var/lib/mongodb \
 -p 8080:80 extremeprog/mongo-sites-api:pack
```

Add msa js interface to your project page.

```html
<script src='http://domain.site.com/mongoSitesApi.js?site=msa'></script>
```

## Mongo Admin Interface
We provide you with the most convenient and handy mongo admin panel where you can view and manage your data.
The interface is available on the port and domain name of you server.

Use admin@msa.com/admin credentials to login and view data as an admin user.

For an advanced configuration proceed with this wiki ... .

## Get and write data examples

#### Get data
```
mongoSitesApi.mgoInterface.find({_type: 'Fruit'})
```

#### Write data
```
mongoSitesApi.mgoInterface.save({_type: 'Fruit', name: 'Banana'})
```


## Futher steps
Read our API documentation.
