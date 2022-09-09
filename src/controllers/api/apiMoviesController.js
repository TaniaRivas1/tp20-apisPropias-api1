const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

const request = require('express')
const getUrl = (req = request) => req.protocol + '://' + req.get('host') + req.originalUrl;


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': async (req, res) => {
        try {
            let movies = await db.Movie.findAll({
                include: ['genre'],
            });
            let response = {
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length
                },
                data: movies
            }
            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            let response = {
                ok: false,
                meta: {
                    status: 500
                }
            }
            return res.status(500).json(response)
        }
    },
    'detail': async (req, res) => {
        if (isNaN(req.params.id)) {
            let response = {
                ok: false,
                meta: {
                    status: 400
                },
                msg: 'Numero de ID incorrecto'
            }
            return res.status(400).json(response)
        }
        try {
            let movie = await db.Movie.findByPk(req.params.id)
            let response;
            if (!movie) {
                response = {
                    ok: false,
                    meta: {
                        status: 404
                    },
                    msg: 'No se encuentra una pelicula con ese ID'
                }
                return res.status(404).json(response)
            }
            response = {
                ok: true,
                meta: {
                    status: 200
                },
                data: movie,
                msg: "Pelicula encontrado"
            }
            return res.status(200).json(response)

        } catch (error) {
            console.log(error)
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(500).json(response)
        }
    },
    'new': async (req, res) => {
        try {
            let movies = await db.Movie.findAll({
                order: [
                    ['release_date', 'DESC']
                ],
                limit: 5
            })
            let response ={
                ok: true,
                meta:{
                    status: 200
                },
                data: movies
            }
            return res.status(200).json(response);
        } catch (error) {
            console.log(error);
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(error.statusCode || 500).json(response)
        }
    },
    'recomended': async (req, res) => {
        try {
            let movie = await  db.Movie.findAll({
                include: ['genre'],
                where: {
                    rating: { [db.Sequelize.Op.gte]: +req.query.rating || 8 }
                },
                order: [
                    ['rating', 'DESC']
                ]
            })
            let response ={
                ok: true,
                meta:{
                    status: 200
                },
                data: movie
            }
            return res.status(200).json(response);
        } catch (error) {
            console.log(error);
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(error.statusCode || 500).json(response)
        }
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async (req, res) => {
        const {title, rating, awards, release_date, length, genre_id} = req.body;
        try {
            let genres = await db.Genre.findAll();
            let genresId = genres.map(genre => genre.id)

            if(!genresId.includes(+genre_id)){
                let error = new Error('ID de genero inexistente');
                error.status = 404;
                throw error
            }

            let newMovie = await db.Movie.create(
                {
                    title,
                    rating,
                    awards,
                    release_date,
                    length,
                    genre_id
                })
                let response;
                if (newMovie) {
                    response = {
                        ok: true,
                        meta:{
                            status:200,
                            url: getUrl(req) + '/' + newMovie.id
                        },
                        data: newMovie
                    }
                    return res.status(200).json(response)
                }
        } catch (error) {
            console.log(error);
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(error.statusCode || 500).json(response)
        }
    },
    update: async (req, res) => {
        if (isNaN(req.params.id)) {
            let response = {
                ok: false,
                meta: {
                    status: 400
                },
                msg: 'Numero de ID incorrecto'
            }
            return res.status(400).json(response)
        }
      
        const {title, rating, awards, release_date, length, genre_id} = req.body;
        try {

            let movies = await db.Movie.findAll();
            let moviesId = movies.map(movie => movie.id)

            if(!moviesId.includes(+req.params.id)){
                let error = new Error('ID de pelicula es inexistente');
                error.status = 404;
                throw error
            }

            let update = await db.Movie.update(
                {
                    title,
                    rating,
                    awards,
                    release_date,
                    length,
                    genre_id
                },
                {
                    where: { id: req.params.id}
                })
                let response;
                if (update[0] === 1) {
                    response = {
                        ok: true,
                        meta:{
                            status: 201,
                        },
                        msg: 'Los cambios fueron guardados con exito'
                    }
                    return res.status(201).json(response)
                }else{
                    response ={
                        ok: true,
                        meta:{
                            status: 200
                        },
                        msg:'No se realizaron los cambios'
                    }
                }
               } catch (error) {
            console.log(error);
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(error.statusCode || 500).json(response)
        }
        
    },
    destroy: async (req, res) => {
        if (isNaN(req.params.id)) {
            let response = {
                ok: false,
                meta: {
                    status: 400
                },
                msg: 'Numero de ID incorrecto'
            }
            return res.status(400).json(response)
        }
        try {
            let movies = await db.Movie.findAll();
            let moviesId = movies.map(movie => movie.id)

            if(!moviesId.includes(+req.params.id)){
                let error = new Error('ID de pelicula es inexistente');
                error.status = 404;
                throw error
            }
            let destroy = await db.Movie.destroy({ 
                where: { id: req.params.id }, 
                force: false
            }) // force: true es para asegurar que se ejecute la acción
            if (destroy) {
                let response = {
                    ok: true,
                    meta:{
                        status: 200,
                    },
                    msg: 'La pelicula fue eliminada con exito',
                }
                return res.status(200).json(response)    
            }else{
                let response = {
                    ok: true,
                    meta:{
                        status: 100,
                    },
                    msg: 'No se realizaron los cambios',
                }
                return res.status(100).json(response)   
            }
            


        } catch (error) {
            console.log(error);
            let response = {
                ok: false,
                meta: {
                    status: 500
                },
                msg: error.message ? error.message : "Comuniquese con el administrador del sitio"
            }
            return res.status(error.statusCode || 500).json(response)
        }
    }
}

module.exports = moviesController;