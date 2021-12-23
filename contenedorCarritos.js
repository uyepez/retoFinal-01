const fs = require('fs')

class ContenedorCarritos {

    constructor(nombreArchivo) {
        this.nombreArchivo = nombreArchivo
        this.ultimoId = 0
        this.carritos = []
    }

    async creaArchivo() {
        try {
            const dataExiste = await fs.promises.readFile(this.nombreArchivo, 'utf-8')
            this.productos = JSON.parse(dataExiste);
            console.log("ya existe");
            return `El archivo pra carritos ${this.nombreArchivo} ya existe`
        } catch (err) {
            await this.guarda()
            console.log('nuevo');
            return `El archivo para carrios ${this.nombreArchivo} fue generado correctamente`
        }

    }


    async guarda() {
        let string = JSON.stringify(this.carritos)
        await fs.promises.writeFile(this.nombreArchivo, string)
    }


    async nuevo(objetoCarrito) {
        let carritosIds = this.carritos.map(item => item.id);
        // crea nuevo Id
        let newId = carritosIds.length > 0 ? Math.max.apply(Math, carritosIds) + 1 : 1;
        objetoCarrito.id = parseInt(newId);

        this.carritos.push(objetoCarrito)

        try {
            await this.guarda()
            return newId;
        } catch (err) {
            return err
        }
    }

    getById(id) {
        let encontrado = this.carritos.filter(carrito => carrito.id == id);
        if (encontrado.length > 0) {
            return encontrado[0];
        } else {
            return null;
        }
    }

    getAll() {
        return this.carritos;
    }

    async update(carrito) {

        let carritoAnterior = this.carritos.indexOf(producto.id) //busca producto existente

        //reemplaza el viejo por el nuevo
        this.carritos.splice(carritoAnterior, 1, carrito);
        try {
            await this.guarda()
            return carrito
        } catch (err) {
            return err
        }


    }


    async deleteById(id) {

        let index = this.carritos.findIndex(carrito => carrito.id === id);
        if (index > -1) {
            this.carritos.splice(index, 1);
        }

        try {
            await this.guarda()
        } catch (err) {
            return err
        }
    }

    async deleteAll() {
        try {
            this.carritos.splice(0, this.carritos.length)
            await this.guarda()
        } catch (err) {
            return err;
        }

    }
}

module.exports = ContenedorCarritos