const Datastore = require('nedb')

const coll1 = new Datastore({
    filename: 'db/kolekcjaCars.db',
    autoload: true
});

const express = require("express")
const app = express()
const PORT = 3000;

app.use(express.json());
const path = require("path")
const hbs = require('express-handlebars');
const { log } = require('console');

app.set('views', path.join(__dirname, 'views')); // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' })); // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs'); // określenie nazwy silnika szablonów


app.get("/", function (req, res) {
    res.render('index.hbs');
})
app.get("/addCar", function (req, res) {
    let get = req.query
    console.log(Object.keys(get))
    console.log(Object.values(get))
    if (Object.keys(get).length == 0) {
        res.render('addCar.hbs');
    } else {
        let ubezpieczony, benzyna, uszkodzony, naped = false
        if (get.ubezpieczony[1] == "TAK") {
            ubezpieczony = true
        }
        if (get.benzyna) {
            benzyna = true
        }
        if (get.uszkodzony) {
            uszkodzony = true
        }
        if (get.naped) {
            naped = true
        }
        let obj = {
            ubezpieczony: ubezpieczony == true ? "TAK" : "NIE",
            benzyna: benzyna == true ? "TAK" : "NIE",
            uszkodzony: uszkodzony == true ? "TAK" : "NIE",
            naped: naped == true ? "TAK" : "NIE",
        }
        console.log(obj)
        coll1.insert(obj, function (err, newDoc) {
            let context = {
                message: "New car with id = " + newDoc._id + " added to db."
            }
            res.render('addCar.hbs', context);
        });

    }
})
app.get("/carsList", function (req, res) {
    coll1.find({}, function (err, docs) {
        console.log(docs)
        let context = {
            cars: docs,
        }
        // console.log(context);
        res.render('carsList.hbs', context);
    });
})
app.get("/deleteCars", function (req, res) {
    let id = Object.keys(req.query)
    id = id[0]
    console.log(id);
    coll1.remove({ _id: id }, {}, function (err, numRemoved) {
        coll1.find({}, function (err, docs) {
            console.log(docs)
            let context = {
                cars: docs
            }
            console.log(context);
            res.render('deleteCars.hbs', context);
        });
    });
})

app.get("/deleteAll", function (req, res) {
    coll1.remove({}, { multi: true }, function (err, numRemoved) {
        coll1.find({}, function (err, docs) {
            console.log(docs)
            let context = {
                cars: docs
            }
            console.log(context);
            res.render('deleteCars.hbs', context);
        });
    })
})
app.get("/deleteSel", function (req, res) {
    let get = req.query
    console.log(Object.keys(get));
    let x = 0
    for (let i = 0; i < Object.keys(get).length; i++) {
        coll1.remove({ _id: Object.keys(get)[i] }, function (err, numRemoved) {
        })
        x = i + 1
    }
    coll1.find({}, function (err, docs) {
        // console.log(docs)
        let context = {}
        if (x == 0) {
            context = {
                cars: docs,
                number: "Select at least one box!"
            }
        } else {
            context = {
                cars: docs,
                number: "Deleted " + x + " car(s)"
            }
        }

        console.log(context);
        res.render('deleteCars.hbs', context);
    });
    // res.render('deleteCars.hbs')
})
app.get("/editCars", function (req, res) {
    coll1.update({}, { $set: { edit: null } }, { multi: true }, function (err, numUpdated) {
        let get = req.query
        console.log(get);
        if (Object.values(get)[0] == "EDIT") {
            coll1.update({ _id: Object.keys(get)[0] }, { $set: { edit: true } }, {}, function (err, numUpdated) {
                coll1.find({}, function (err, docs) {
                    // console.log(docs)
                    let context = {
                        cars: docs,
                    }
                    // console.log(context);
                    res.render('editCars.hbs', context);

                });
            });
        }
        else {
            coll1.find({}, function (err, docs) {
                // console.log(docs)
                let context = {
                    cars: docs
                }
                // console.log(context);
                res.render('editCars.hbs', context);
            });
        }
    });

});

app.get("/updateCars", function (req, res) {
    let get = req.query
    console.log(get);
    obj = {
        ubezpieczony: get.ubezpieczony,
        benzyna: get.benzyna,
        uszkodzony: get.uszkodzony,
        naped: get.naped
    }
    coll1.update({ _id: Object.keys(get)[4] }, { $set: { edit: null } }, {}, function (err, numUpdated) {
        coll1.update({ _id: Object.keys(get)[4] }, { $set: obj }, {}, function (err, numUpdated) {
            coll1.find({}, function (err, docs) {
                // console.log(docs)
                let context = {
                    cars: docs
                }
                // console.log(context);
                res.render('editCars.hbs', context);
            });
        });
    });

})


app.use(express.static('static'))


app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})