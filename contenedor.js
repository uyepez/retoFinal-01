const fs = require('fs')

class Contenedor {

    constructor(nombreArchivo) {
        this.nombreArchivo = nombreArchivo
        this.ultimoId = 0
        this.productos = []
    }

    async creaArchivo() {
        try {
            const dataExiste = await fs.promises.readFile(this.nombreArchivo, 'utf-8')
            this.productos = JSON.parse(dataExiste);
            console.log("ya existe");
            return `El archivo ${this.nombreArchivo} ya existe`
        } catch (err) {
            await this.guarda()
            console.log('nuevo');
            return `El archivo ${this.nombreArchivo} fue generado correctamente`
        }

    }


    async guarda() {
        let string = JSON.stringify(this.productos)
        await fs.promises.writeFile(this.nombreArchivo, string)
    }


    async nuevo(objetoProducto) {
        let productosIds = this.productos.map(item => item.id);
        // crea nuevo Id
        let newId = productosIds.length > 0 ? Math.max.apply(Math, productosIds) + 1 : 1;
        objetoProducto.id = parseInt(newId);

        this.productos.push(objetoProducto)

        try {
            await this.guarda()
            return objetoProducto;
        } catch (err) {
            return err
        }
    }

    getById(id) {
        let encontrado = this.productos.filter(producto => producto.id == id);
        if (encontrado.length > 0) {
            return encontrado[0];
        } else {
            return null;
        }
    }

    getAll() {
        return this.productos;
    }

    async update(producto) {

        let productoAnterior = this.productos.indexOf(producto.id) //busca producto existente

        //reemplaza el viejo por el nuevo
        this.productos.splice(productoAnterior, 1, producto);
        try {
            await this.guarda()
            return producto
        } catch (err) {
            return err
        }


    }


    async deleteById(id) {

        let index = this.productos.findIndex(producto => producto.id === id);
        if (index > -1) {
            this.productos.splice(index, 1);
        }

        try {
            await this.guarda()
        } catch (err) {
            return err
        }
    }

    async deleteAll() {
        try {
            this.productos.splice(0, this.productos.length)
            await this.guarda()
        } catch (err) {
            return err;
        }

    }
}

module.exports = Contenedor