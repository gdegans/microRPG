/* AMÉLIORATIONS :

	- Bug avec express.socket-io.session :
		X Message nouvel ennemi qui n'apparait qu'une seule fois
		X Level up
		- Quand on prend une potion pendant qu'un ennemi est à zéro

	- Global :
		- Optimiser les fonctions
		- Supprimer les envois inutiles

	- Système de level up :
		X Pour le joueur
		X Niveau des monstres et caractéristiques scalés
		? Améliorer le level scaling

	- Système d'inventaire :
		X Inventaire pour le joueur (équipement/objets)
		- Utiliser une potion
		- Équiper un objet
		X Inventaire pour les ennemis
		X Récupérer plusieurs objets en même temps
		- Gestion de l'or
		- Trier l'inventaire

	- Système d'équipement :
		- Armes, Armure/Bouclier

	- Déplacement des ennemis :
		X Identifier chaque ennemi
		X Toujours forcer un déplacement sauf quand le joueur est à une case
		- Quand on entre en combat, déplacement de tous les ennemis sauf celui en combat

	- Graphismes :
		- Personnages
		- Décors
		- Objets

	- Modification de la map

*/

/* Quand le client se connecte, joueur est créé côté serveur et est envoyé
Lorqu'il demande_combat, il envoie joueur au serveur et ennemi est créé, tout est renvoyé
*/

// Déclarer method sur le front et le back

// function.toString

// object.assign
// Créer un objet vide sur le front
// Rajoute les methodes d'un objet sur un autre objet qui ne les a pas

var map = [];
var joueur = [];
var ennemis = [];
var ennemi = [];
var idEnnemi = false;
var nouvelID = 0;
var check = "";

var app = require('express')();
var server  = require("http").createServer(app);
var io = require("socket.io")(server);
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

var ent = require('ent');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Attach session
app.use(session);

// Share session with io sockets
io.use(sharedsession(session));

app.get('/', function(req, res) { // Quand on arrive à la racine
	res.sendFile(__dirname + '/creer_joueur.html'); // On charge la page index.html
});

app.get('/jeu/', function(req, res, next) {
	res.render('jeu.ejs', {
		joueur: req.session.joueur,
		map: req.session.map,
		ennemis: req.session.ennemis,
		idEnnemi: req.session.idEnnemi
	});
	//console.log(req.session.ennemis);
});

app.get('/inventaire/:idObjet', function(req, res) { // Quand on arrive à la racine
	if (Number.isInteger(parseInt(req.params.idObjet, 10))) {
		idObjet = parseInt(req.params.idObjet, 10);
		console.log(req.params.idObjet + " est un nombre");
		if (idObjet < req.session.joueur.inventaire.length) {

			if (req.session.joueur.inventaire[idObjet] === "Potion du mob") {
				req.session.joueur.pv += 15;
				if (req.session.joueur.pv > req.session.joueur.pvMax) {
					req.session.joueur.pv = req.session.joueur.pvMax;
				}
			} else if (req.session.joueur.inventaire[idObjet] === "Épée courte") {
				req.session.joueur.force += 2;
			}
			req.session.joueur.inventaire.splice(idObjet, 1);
		}
	  res.redirect('/jeu/');

  } else {
  		console.log(req.params.id + " n'est pas un nombre");
  		//joueur.inventaire.splice(req.params.id, 1);
  	  res.redirect('/');
  }
});

io.on("connection", function(socket) {
    // Accept a login event with user's data
    socket.on("creation_joueur", function(pseudo) {
		CreerJoueur(pseudo);
        socket.handshake.session.joueur = joueur;
        socket.handshake.session.save();
		//console.log(socket.handshake.session.joueur);
    });

	socket.on("creation_map", function() {
		x = 9;
		y = 9;
		map = CreerMap(x, y);
		LocaliserJoueur(joueur, map);
		i = 0;
		while (i < 8) {
			CreerEnnemi("E", x, y);
			i++;
		}
		socket.handshake.session.map = map;
		socket.handshake.session.ennemis = ennemis;
        socket.handshake.session.save();
		var destination = '/jeu/';
		socket.emit('redirect', destination);
	});

	socket.on("debut_combat", function(data) {
		joueur = data.joueurClient;
		map = data.mapClient;
		ennemis = data.ennemisClient;
		idEnnemi = data.idEnnemiClient;
		socket.handshake.session.joueur = joueur;
		socket.handshake.session.ennemis = ennemis;
		socket.handshake.session.idEnnemi = idEnnemi;
		socket.handshake.session.map = map;
		socket.handshake.session.save();
		var destination = '/jeu/';
		socket.emit('redirect', destination);
		//console.log(socket.handshake.session.idEnnemi);
	});

	socket.on("actualiser", function(data) {
		joueur = data.joueurClient;
		ennemis = data.ennemisClient;
		idEnnemi = data.idEnnemiClient;
		map = data.mapClient;
		console.log(idEnnemi);
		if (joueur.xp >= joueur.palier) {
			LevelUp(joueur);
			ennemis.forEach(function(ennemi) {
				if (typeof(ennemi.id) != "undefined") {
					ennemi.niveau++;
					ennemi.pv = Aleatoire(1, 2) + ennemi.niveau * 3;
					ennemi.force = Aleatoire(1, 2) + ennemi.niveau * 2;
					ennemi.defense = Aleatoire(1, 2) + ennemi.niveau * 3;
					console.log("Level up de " + ennemi.id);
				}
			});
			//console.log(ennemis);
			socket.handshake.session.joueur = joueur;
			socket.handshake.session.map = map;
			socket.handshake.session.ennemis = ennemis;
			socket.handshake.session.idEnnemi = idEnnemi;
			socket.handshake.session.save();
			console.log(socket.handshake.session.ennemis);
			var destination = '/jeu/';
			socket.emit('redirect', destination);
		} else {
			console.log("Pas de level up");
			socket.handshake.session.joueur = joueur;
			socket.handshake.session.map = map;
			socket.handshake.session.ennemis = ennemis;
			socket.handshake.session.idEnnemi = idEnnemi;
			socket.handshake.session.save();
			var destination = '/jeu/';
			socket.emit('redirect', destination);
		}
	});

	socket.on("supprimer_ennemi", function(data) {
		ennemis = socket.handshake.session.ennemis;
		idEnnemi = data.idEnnemiClient;
		ennemi = ennemis[idEnnemi];
		CreerEnnemi("E", x, y);
		console.log(ennemis[idEnnemi]);
		ennemis[idEnnemi] = [];
		idEnnemi = false;
		socket.handshake.session.joueur = joueur;
		socket.handshake.session.map = map;
		socket.handshake.session.ennemis = ennemis;
		socket.handshake.session.idEnnemi = idEnnemi;
		socket.handshake.session.save();
		console.log('Combat : ' + joueur.enCombat);
		console.log(ennemis[idEnnemi]);
		var destination = '/jeu/';
		socket.emit('redirect', destination);
	});

    socket.on("logout", function(userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });
});

class Map {
	constructor(x, y) {
		this.xmax = x;
		this.ymax = y;
	}
}

class Joueur {
	constructor(nom, niveau, pv, force, defense) {
		this.nom = nom;
		this.niveau = niveau;
		this.pv = pv;
		this.pvMax = pv;
		this.force = force;
		this.defense = defense;
		this.inventaire = [];
		this.xp = 0;
		this.palier = 30;
		this.nbAttaque = 0;
		this.enCombat = 0;
		this.positionX = 1;
		this.positionY = 1;
	}
}

class Ennemi {
	constructor(id, nom, niveau, pv, force, defense) {
		this.id = id;
		this.nom = nom;
		this.niveau = niveau;
		this.pv = pv;
		this.force = force;
		this.defense = defense;
		this.inventaire = [];
		this.xp = force;
		this.nbAttaque = 0;
		this.positionX = 1;
		this.positionY = 1;
	}
}

function Aleatoire(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Chance(pourcentage) {
	var tirage = Aleatoire(1, 100);
	if (tirage <= pourcentage) {
		resultat = true;
	} else {
		resultat = false;
	}
	return resultat;
}

function Attaquer(attaquant, cible) {
	attaquant.nbAttaque++;
	degats = attaquant.force - cible.defense;
	if (degats <= 0) {
		degats = 1;
	}
	cible.pv -= degats;
	if (cible.pv < 0) {
		cible.pv = 0;
	}
}

function CreerJoueur(pseudo) {
	joueur = new Joueur("", 1, 25, 5, 5);
	joueur.nom = pseudo;
	joueur.pvMax += Aleatoire(1, 3);
	joueur.pv = joueur.pvMax;
	joueur.force += Aleatoire(1, 3);
	joueur.defense += Aleatoire(1, 3);
}

function LevelUp(joueur) {
	joueur.pvMax += Aleatoire(1, 3) + joueur.niveau * Aleatoire(1, 2);
	joueur.pv = joueur.pvMax;
	joueur.force += Aleatoire(1, 3) + joueur.niveau * Aleatoire(1, 2);
	joueur.defense += Aleatoire(1, 3) + joueur.niveau * Aleatoire(1, 2);
	joueur.niveau++;
	joueur.xp -= joueur.palier;
	joueur.palier = Math.floor(joueur.palier * 1.6);
}

function CreerEnnemi(nom, xmax, ymax) {
	ennemi = new Ennemi(0, nom, 1, 8, 3, 1);
	ennemi.id = nouvelID;
	nouvelID++;
	ennemi.niveau = joueur.niveau + Aleatoire(1, 2) - 1;
	ennemi.pv = Aleatoire(1, 2) + ennemi.niveau * 3;
	ennemi.force = Aleatoire(1, 2) + ennemi.niveau * 3;
	ennemi.defense = Aleatoire(1, 2) + ennemi.niveau * 3;
	ennemi.xp = ennemi.force;
	ennemi.positionX = Aleatoire(1, xmax);
	ennemi.positionY = Aleatoire(1, ymax);
	while (map[ennemi.positionX][ennemi.positionY] != "") {
		ennemi.positionX = Aleatoire(1, xmax);
		ennemi.positionY = Aleatoire(1, ymax);
	}
	map[ennemi.positionX][ennemi.positionY] = nom;
	if (Chance(40)) {
		ennemi.inventaire.push("Potion du mob");
	}
	if (Chance(10)) {
		ennemi.inventaire.push("Épée courte");
	}
	if (ennemi.inventaire === []) {
		ennemi.inventaire = "";
	}
	ennemis.push(ennemi);
}

function CreerMap(x, y) { // Créé une map de taille x * y
	ennemis = [];
	ennemi = [];
	nouvelID = 0;
	map = new Map(x, y);
	map.xmax = x;
	map.ymax = y;
	if (x < 1 || y < 1) {
	return "Erreur !";
	}
	var i = 1;
	var j = 1;
	while(i <= x) {
		map[i] = [];
		while(j <= y) {
			//map[i][j] = i + ", " + j;
			map[i][j] = "";
			j++;
		}
	j = 1;
	i++;
	}
	return map;
}

function LocaliserJoueur(joueur, map) {
	xmax = map.xmax;
	ymax = map.ymax;
	joueur.positionX = Aleatoire(1, xmax);
	joueur.positionY = Aleatoire(1, ymax);
	map[joueur.positionX][joueur.positionY] = "J";
}

server.listen(8080);
