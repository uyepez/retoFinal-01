const express = require('express')
//const multer = require('multer')
const { Router } = express

const Contenedor = require('./contenedor.js') //control de altas y bajas de productos
const ContenedorCarritos = require('./contenedorCarritos.js') //control de altas y bajas de productos


const app = express();
const PORT = process.env.port || 3000;
//const PORT = 3000;
const router = Router();


let listaProductos = new Contenedor('productos.txt')
let listaCarritos = new Contenedor('carritos.txt')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const muestrasProductos = async function () {
    const nuevo = await listaProductos.creaArchivo();
    console.log(nuevo);
};

muestrasProductos(); //inicializo mi archivo de productos

const muestrasCarritos = async function (){
    const nuevoC = await listaCarritos.creaArchivo();
    console.log(nuevoC);
};

muestrasCarritos();


//control de productos
router.get('/productos/:id?', (req, res) => {
    const admin = req.params.admin?true:false;
    if (req.params.id) {
        const producto = listaProductos.getById(req.params.id)
        if (producto) {
            res.status(200).send(producto);
        } else {
            res.status(404).send({ error: -1, descripcion: `Producto con el id ${req.params.id} no encontrado` });
        }
    }else{
        res.status(200).send(listaProductos.productos)
    }
})


//NUEVO PRODUCTO
//router.post('/productos/:admin', upload.single('thumbnail'), (req, res) => {
router.post('/productos/:admin', (req, res) => {
    const admin = req.params.admin ? true : false;
    if (admin === true) {
        //console.log('body:', req.body);        
        let nuevoProducto = {
            timestamp: Date.now(),
            nombre: req.body.nombre, 
            descripcion: req.body.descripcion, 
            codigo: req.body.codigo, 
            precio: req.body.precio, 
            stock: req.body.stock, 
            foto: req.body.foto, 
            id: 0
        }
        const ultimoProducto = listaProductos.nuevo(nuevoProducto);
        res.status(200).send({ error: 0, descripcion: `Producto con el id ${nuevoProducto.id} guardado correctamente`, producto: nuevoProducto })
    }else{
        res.status(404).send({ error: -1, descripcion: `Metodo no encontrado` })
    }
})

//ACTUALIZA PRODUCTO
router.put('/productos/:id/:admin', (req, res) => {
    const admin = req.params.admin ? true : false;
    if (admin === true && req.params.id) {
        const producto = listaProductos.getById(req.params.id)
        if (producto) {
            let nuevoProducto = {
                timestamp: Date.now(),
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                codigo: req.body.codigo,
                precio: req.body.precio,
                stock: req.body.stock,
                foto: req.body.foto,
                id: Number(req.params.id)
            }

            const actualizado = listaProductos.update(nuevoProducto);
            res.status(200).send({ error: 0, descripcion: `Producto con el id ${req.params.id} actualizado correctamente`, producto:nuevoProducto });
        } else {
            res.status(404).send({ error: -1, descripcion: `Producto con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No tienes permisos` })
    }
})

//BORRA PRODUCTO
router.delete('/productos/:id/:admin', (req, res) => {
    const admin = req.params.admin ? true : false;
    if (admin === true && req.params.id) {
        const producto = listaProductos.getById(req.params.id)
        if (producto) {
            listaProductos.deleteById(Number(req.params.id));
            res.status(200).send({ error: 0, descripcion: `Producto con el id ${req.params.id} eliminado` });
        } else {
            res.status(404).send({ error: -1, descripcion: `Producto con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No tienes permisos` })
    }
})


//control de carritos
//NUEVO CARRITO
router.post('/carrito/', (req, res) => {
      
    let nuevoCarrito = {
        id: 0,
        timestamp: Date.now(),
        productos: []
    }
    listaCarritos.nuevo(nuevoCarrito).then( resp => {
        console.log(resp);
        const ultimoCarrito = resp;
        res.status(200).send({ error: 0, descripcion: `Carrito con el id ${ultimoCarrito.id} guardado correctamente`, carrito: ultimoCarrito })
    })

})

//elimina carrito
router.delete('/carrito/:id', (req, res) => {

    if (req.params.id) {
        const carrito = listaCarritos.getById(req.params.id)
        if (carrito) {
            listaCarritos.deleteById(Number(req.params.id));
            res.status(200).send({ error: 0, descripcion: `carrito con el id ${req.params.id} eliminado` });
        } else {
            res.status(404).send({ error: -1, descripcion: `Carrito con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No tienes permisos` })
    }
})

//elimina producto del carrito
router.delete('/carrito/:id/productos/:id_prod', (req, res) => {

    if (req.params.id) {
        const carrito = listaCarritos.getById(req.params.id)
        if (carrito) {
            //existe el carrito ahora buscamos el id de producto y eliminamos
            let idProducto = Number(req.params.id_prod)
            let indexProducto = carrito.productos.findIndex(producto => producto.id === idProducto); //index del producto encontrado

            if(indexProducto>=0){
                carrito.productos.splice(indexProducto, 1);
                listaCarritos.update(carrito).then(resp => {
                    res.status(200).send({ error: 0, descripcion: `producto con el id ${req.params.id_prod} eliminado` });
                })
            }else{
                res.status(404).send({ error: -1, descripcion: `Producto con el id ${req.params.id_prod} no encontrado` });
            }
        } else {
            res.status(404).send({ error: -1, descripcion: `Carrito con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No tienes permisos` })
    }
})

//lista de productos por carrito
router.get('/carrito/:id/productos', (req, res) => {

    if (req.params.id) {
        const carrito = listaCarritos.getById(req.params.id)
        if (carrito) {
            res.status(200).send(carrito.productos);
        } else {
            res.status(404).send({ error: -1, descripcion: `Carrito con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No hay un id de carrito` })
    }
})

//agrega productos al carrito
router.post('/carrito/:id/productos', (req, res) => {

    if (req.params.id) {
        const carrito = listaCarritos.getById(req.params.id)
        if (carrito) {
            //agrega productos
            //busca producto
            const producto = listaProductos.getById(req.body.id)
            if (producto) {
                carrito.productos.push(producto);
                listaCarritos.update(carrito).then( resp => {
                    res.status(200).send(resp);
                })
            } else {
                res.status(404).send({ error: -1, descripcion: `Producto con el id ${req.body.id} no encontrado` });
            }
        } else {
            res.status(404).send({ error: -1, descripcion: `Carrito con el id ${req.params.id} no encontrado` });
        }
    } else {
        res.status(404).send({ error: -1, descripcion: `No hay un id de carrito` })
    }
})


//para cualquier otra ruta
router.get('*', (req, res) => {
    res.send({ error: -1, descripcion: `Ruta ${req.path} no encontrada` })
})

//directorios estaticos
app.use('/api', router)
app.use('/static', express.static(__dirname + '/public'));
app.listen(3000)
