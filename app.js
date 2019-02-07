/* AMÉLIORATIONS :

xhr (ajax)
fetch, utilise des promise
fetch(url).then(x => x.text()).then(x => )

	- Schéma de jeu :
		- Première connexion, demande pseudo, création du joueur, de la map et des mobs
		- Déplacement en local sur la map
		- Lors d'une rencontre, premier envoi en session (pertinence ?)
		- A chaque attaque, envoi session (dans le but d'utiliser des objets en cliquant vers une autre page)

		! Faire uniquement des enregistrements réguliers en session, mais tout faire en local + socket.io ?
		- Comment gérer l'utilisation d'objets notamment en combat ?

		- Ne pas renvoyer sur le serveur à chaque fois mais proposer une sauvegarde ?
		- Quelle pertinence de faire des aller-retours serveur-client ?
		- Privilégier les event avec socket.io !
		- AJAX ?
		- Recharger la page une fois en entrant ou en sortant d'un combat = pas dérangeant
		- Faire uniquement des envois reguliers au serveur, mais tout faire en local ?

	- Éviter au maximum les chargements de page pour faire des anim, ou garder la valeur avant et après modif
	 -

	- Bug avec express.socket-io.session :
		- Ennemi qui annule notre attaque quand on se soigne lors de sa mort
		? Parfois déplacement des ennemis quand on prend un objet ?
		- Bug d'affichage quand on raffraichit trop vite

	- Global :
		- Optimiser les fonctions
		- Supprimer les envois inutiles

	- BDD :
		X Ennemis
		- Objets
		- Equipement

	- Système de level up :
		? Améliorer le level scaling

	- Graphismes :
		X Personnages
		- Décors
		- Objets
		- Afficher la barre de vie
		- Afficher la barre de mana
		- Animations ?

	- Système de message :
		- Quand on rencontre un ennemi
		- Quand on gagne un combat
		- Quand on passe un level
		- Possibilité d'un bouton pour effacer et passer le message

	- Déplacement des ennemis :
		- Quand on entre en combat, déplacement de tous les ennemis sauf celui en combat

	- Système de magie


	- Modification de la map :
		- Déplacement sur une grande map (Zelda 1 / Zelda 3)

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
/*
class BaseEnnemis {
	constructor(type, nom, niveau, pv, force, defense) {
		this.type = type;
		this.nom = nom;
		this.niveau = niveau;
		this.pv = pv;
		this.force = force;
		this.defense = defense;
	}
}
*/
class Objet {
	constructor(type, nom, modifPv, modifForce, modifDefense) {
		this.type = type;
		this.nom = nom;
		this.modifPv = modifPv,
		this.modifForce = modifForce,
		this.modifDefense = modifDefense
	}
}

var baseObjets = [];
var objetPotion = new Objet(0, "Potion de soin", 10, 0, 0);
baseObjets.push(objetPotion);

var baseEquipements = [];
var equipementEpeeCourte = {
	type: 0,
	nom: "Épée courte",
	modifForce: 2,
	modifDefense: 0
}
baseEquipements.push(equipementEpeeCourte);

joueur.mainG;


var baseEnnemis = [];
var ennemiFourmi = {
	type: 0,
	nom: "Fourmi",
	niveau: 1,
	pv: 1,
	force: 1,
	defense: 1
};
var ennemiRat = {
	type: 1,
	nom: "Rat mutant",
	niveau: 1,
	pv: 1,
	force: 1,
	defense: 1
};
var ennemiLoup = {
	type: 2,
	nom: "Loup",
	niveau: 1,
	pv: 1,
	force: 1,
	defense: 1
};
baseEnnemis.push(ennemiFourmi);
baseEnnemis.push(ennemiRat);
baseEnnemis.push(ennemiLoup);
/*
baseEnnemis[0].type = 0;
baseEnnemis[0].nom = "E";
baseEnnemis[0].niveau = "1";
baseEnnemis[0].pv = "1";
baseEnnemis[0].force = "1";
baseEnnemis[0].defense = "1";
*/
var app = require('express')();
var express = require('express');
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

app.use(express.static(__dirname + '/public'));


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
	if ((joueur.pv != 0) && (Number.isInteger(parseInt(req.params.idObjet, 10)))) {
			idObjet = parseInt(req.params.idObjet, 10);
			console.log(req.params.idObjet + " est un nombre");
			if (idObjet < req.session.joueur.inventaire.length) {

				//if (req.session.joueur.inventaire[idObjet].type === "Potion du mob") {
					req.session.joueur.pv += req.session.joueur.inventaire[idObjet].modifPv;
					if (req.session.joueur.pv > req.session.joueur.pvMax) {
						req.session.joueur.pv = req.session.joueur.pvMax;
					}
				//} else if (req.session.joueur.inventaire[idObjet] === "Épée courte") {
					//req.session.joueur.mainG = "Épée courte (+2)";
					//req.session.joueur.force += 2;
				//}
				req.session.joueur.inventaire.splice(idObjet, 1);
			}
		  res.redirect('/jeu/');

	  } else {
	  		//console.log(req.params.id + " n'est pas un nombre");
	  		//joueur.inventaire.splice(req.params.id, 1);
	  	  res.redirect('/jeu/');
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
			CreerEnnemi(1, x, y);
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
		CreerEnnemi(2, x, y);
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
		this.or = 0;
		this.mainG = "";
		this.mainD = "";
		this.armure = "";
		this.palier = 30;
		this.nbAttaque = 0;
		this.enCombat = 0;
		this.positionX = 1;
		this.positionY = 1;
	}
}

class Ennemi {
	constructor(id, type, nom, niveau, pv, force, defense) {
		this.id = id;
		this.type = type;
		this.nom = nom;
		this.niveau = niveau;
		this.pv = pv;
		this.force = force;
		this.defense = defense;
		this.inventaire = [];
		this.or = 0;
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
	joueur.or = 5 + Aleatoire(1, 3);
}

function LevelUp(joueur) {
	joueur.pvMax += Aleatoire(1, 2) + joueur.niveau * Aleatoire(1, 2);
	//joueur.pv = joueur.pvMax;
	joueur.force += Aleatoire(1, 2) + joueur.niveau * Aleatoire(1, 2);
	joueur.defense += Aleatoire(1, 2) + joueur.niveau * Aleatoire(1, 2);
	joueur.niveau++;
	joueur.xp -= joueur.palier;
	joueur.palier = Math.floor(joueur.palier * 1.6);
}

function CreerEnnemi(type, xmax, ymax) {
	//ennemi = new Ennemi(0, nom, 1, 8, 3, 1);
	ennemi = new Ennemi(nouvelID, type, baseEnnemis[type].nom, baseEnnemis[type].niveau, baseEnnemis[type].pv, baseEnnemis[type].force, baseEnnemis[type].defense);
	//ennemi.id = nouvelID;
	nouvelID++;
	ennemi.type = type;
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
	map[ennemi.positionX][ennemi.positionY] = ennemi.nom;
	if (Chance(60)) {
		ennemi.inventaire.push(baseObjets[0]);
	}
	if (Chance(0)) {
		ennemi.inventaire.push("Épée courte");
	}
	if (ennemi.inventaire === []) {
		ennemi.inventaire = "";
	}
	ennemi.or = Aleatoire(1, 2) * ennemi.niveau + Aleatoire(1, 5);
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
