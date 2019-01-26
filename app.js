/* Quand le client se connecte, joueur est créé côté serveur et est envoyé
Lorqu'il demande_combat, il envoie joueur au serveur et ennemi est créé, tout est renvoyé
*/

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');

var joueur = [];

class Joueur {
  constructor(nom, niveau, pv, force, defense) {
    this.nom = nom;
    this.niveau =  niveau;
    this.pv = pv;
    this.force = force;
    this.defense = defense;
    this.inventaire = [];
    this.xp = 0;
    this.nbAttaque = 0;
    this.enCombat = 0;
  }
}

class Ennemi {
  constructor(nom, niveau, pv, force, defense, valeur_xp) {
    this.nom = nom;
    this.niveau =  niveau;
    this.pv = pv;
    this.force = force;
    this.defense = defense;
    this.inventaire = [];
    this.valeur_xp = force;
    this.nbAttaque = 0;
  }
}

function Aleatoire(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Attaquer(attaquant, cible) {
  attaquant.nbAttaque++;
  degats = attaquant.force - cible.defense;
  if (degats < 0) {
    degats = 0;
  }
  cible.pv -= degats;
  if (cible.pv < 0) {
    cible.pv = 0;
  }
}

function CreerJoueur(pseudo) {
  joueur = new Joueur("", 1, 10, 5, 3);
  joueur.nom = pseudo;
  joueur.pv += Aleatoire(1, 3);
  joueur.force += Aleatoire(1, 3);
  joueur.defense += Aleatoire(1, 3);
}

function CreerEnnemi() {
  ennemi = new Ennemi("Rat mutant", 1, 8, 2, 1);
  ennemi.pv += Aleatoire(1, 3);
  ennemi.force += Aleatoire(1, 3);
  ennemi.defense += Aleatoire(1, 3);
  ennemi.xp = ennemi.force;
  joueur.enCombat = 1;
}

app.get('/', function(req, res) { // Quand on arrive à la racine
  res.sendFile(__dirname + '/index.html'); // On charge la page index.html
});

io.sockets.on('connection', function(socket) { // Connexion
  socket.on('creation_joueur', function(pseudo) { // Lorsqu'un client arrive...
    CreerJoueur(pseudo);
    socket.emit('envoi_joueur', { joueurServeur: joueur}); // On lui envoie la liste
//    console.log("Création du personnage : OK");
  });

  socket.on('creation_ennemi', function(data) {
    joueur = data.joueurClient;
    joueur.nbAttaque = 0;
    joueur.enCombat = 1;
//    console.log('Demande de combat reçue');
    CreerEnnemi();
    socket.emit('nouvel_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi}); // On lui envoie la liste
    socket.emit('actualiser', { joueurServeur: joueur, ennemiServeur: ennemi});
//    console.log(joueur.pv);
  });

  socket.on('attaque', function(data) {
    joueur = data.joueurClient;
    ennemi = data.ennemiClient;
//    console.log(ennemi);
    Attaquer(joueur, ennemi);
    Attaquer(ennemi, joueur);
    console.log(joueur.nbAttaque);
//    console.log(ennemi);
//    console.log("fin attaque");
    socket.emit('actualiser', { joueurServeur: joueur, ennemiServeur: ennemi});
    if(joueur.pv === 0) {
      socket.emit('mort_joueur', joueur);
    }
    else if(ennemi.pv === 0) {
      joueur.xp += ennemi.xp;
  //    ennemi.xp = 0;
      socket.emit('mort_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi});
      socket.emit('actualiser', { joueurServeur: joueur, ennemiServeur: ennemi});

  //    ennemi.force = 0;
    }
  });

});

server.listen(8080);
