
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('author')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                for (var i = 0; i < favorites.length; i++) {
                    if (favorites[i].author._id.equals(req.user._id)) {
                        res.json(favorites[i]);
                        return;
                    }
                }
                res.json([]);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.find({})
            .then((favorite) => {
                for (var i = 0; i < favorite.length; i++) {
                    if (favorite[i].author._id.equals(req.user._id)) {
                        //************
                        for (let x of req.body) {
                            if (favorite[i].dishes.indexOf(x._id) === -1) {
                                favorite[i].dishes.push(x._id);
                            }
                        }
                        //***************** */
                        favorite[i].save()
                        console.log('Favorite Created ', favorite[i])
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite[i]);
                        return;
                    }

                }

                Favorites.create({})
                    .then((favorite) => {
                        //******* */
                        for (let x of req.body) {
                            if (favorite.dishes.indexOf(x._id) === -1) {
                                favorite.dishes.push(x._id);
                            }
                        }
                        //**** */
                        favorite.author = req.user._id
                        favorite.save()
                        console.log('Favorite Created ', favorite)
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }
                        , (err) => next(err))
                    .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        //******* */ 
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .then((favorite) => {
                for (var i = 0; i < favorite.length; i++) {
                    if (favorite[i].author._id.equals(req.user._id)) {
                        favorite[i].remove();
                        favorite[i].save()

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite[i]);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.find({})
            .then((favorite) => {
                for (var i = 0; i < favorite.length; i++) {
                    if (favorite[i].author._id.equals(req.user._id)) {
                        //************
                        if (favorite[i].dishes.indexOf(req.params.dishId) === -1) {
                            favorite[i].dishes.push(req.params.dishId);
                        }
                        //***************** */
                        favorite[i].save()
                        console.log('Favorite Created ', favorite[i])
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite[i]);
                        return;
                    }
                }
                Favorites.create({})
                    .then((favorite) => {
                        //******* */
                            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                                favorite.dishes.push(req.params.dishId);
                            }
                        //**** */
                        favorite.author = req.user._id
                        favorite.save()
                        console.log('Favorite Created ', favorite)
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }
                        , (err) => next(err))
                    .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        //******* */ 
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .then((favorite) => {
                for (var i = 0; i < favorite.length; i++) {
                    if (favorite[i].author._id.equals(req.user._id)) {
                        const indx=favorite[i].dishes.indexOf(req.params.dishId)
                        if (indx !== -1) {
                            favorite[i].dishes.splice(indx,1);
                        }
                        favorite[i].save()

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite[i]);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;

