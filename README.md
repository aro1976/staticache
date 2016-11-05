# staticache
Is a microservice to help create a central static file store to facilitate caching in browser and cdn.

## Usage

### Upload a regular file
Uploads a regular file such as css or javascript

``` bash
$ curl --form file=@samples/bootstrap.css    \
       --form path=samples/bootstrap.css  \
              http://localhost:8080/static
```

```json
{
  "content_type":"application/octet-stream",
  "path":"samples/bootstrap.min.css",
  "id":"6527d8bf3e1e9368bab8c7b60f56bc01fa3afd68",
  "size":121200
}
```

### Upload a image file
Uploads a image file such as jpg, gif and png

Whenever you upload an image, it is possible to generate scaled versions automatically.

``` bash
$ curl --form file=@samples/image.jpg     \
       --form path=samples/image.jpg      \
       --form scale=120x120,240x240,450x450
              http://localhost:8080/static
```
the response will be something similar to:
```json
{
	"content_type":"image/jpeg",
	"path":"samples/49620.jpg",
	"width":900,
	"height":900,
	"id":"c7ffcc4f56cfbbf8887b9424c7c4923d3d7e90aa",
	"size":512260,
	"scaled":[
		{
			"id":"0c6ceeb8fd9f88b124de5b68e03d76ddecb7f112",
			"width":450,
			"height":450,
			"size":31443
		},{
			"id":"63abb6b1c53f9ca60797af424876c99f87aba312",
			"width":120,
			"height":120,
			"size":3355
		},{
			"id":"bd9a092087121abb759f22691494e0d0ce5e9f39",
			"width":240,
			"height":240,
			"size":10262
		}
	]
}
```

