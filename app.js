/* Quand le client se connecte, joueur est créé côté serveur et est envoyé
Lorqu'il demande_combat, il envoie joueur au serveur et ennemi est créé, tout est renvoyé
*/

// Déclarer method sur le front et le back

// function.toString

// object.assign
// Créer un objet vide sur le front
// Rajoute les methodes d'un objet sur un autre objet qui ne les a pas

var positionX = 1;
var positionY = 1;
var map = [];
//map[1] = [];
//map[1][1] = "Case vide";
/* map[1][1] = ;
map[1][2] = ;
map[1][3] = ;
map[1][4] = ;
map[2][1] = ;
map[2][2] = ;
map[2][3] = ;
map[2][4] = ;
map[3][1] = ;
map[3][2] = ;
map[3][3] = ;
map[3][4] = ;
map[3][1] = ;
map[3][2] = ;
map[3][3] = ;
map[3][4] = ; */

// console.log(CreerMap(3, 3));

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');

var joueur = [];

class Map {
  constructor(x, y) {
    this.xmax = x;
    this.ymax = y;
  }
}

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
    this.positionY = 1;
    this.positionX = 1;
  }
}

class Ennemi {
  constructor(nom, niveau, pv, force, defense, valeur_xp) {
    this.nom = nom;
    this.niveau = niveau;
    this.pv = pv;
    this.force = force;
    this.defense = defense;
    this.inventaire = [];
    this.valeur_xp = force;
    this.nbAttaque = 0;
  }
}

function AjouterEnnemi(xmax, ymax) {
  positionXEnnemi = Aleatoire(1, xmax);
  positionYEnnemi = Aleatoire(1, ymax);
  map[positionXEnnemi][positionYEnnemi] = "X";
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

function CheckDeplacementJoueur(map, joueur) {
  if (map[joueur.positionX][joueur.positionY] === "X") {
    map[joueur.positionX][joueur.positionY] = "Baston";
    check = 1;
    CreerEnnemi();
  } else {
    map[joueur.positionX][joueur.positionY] = "Joueur";
    //map[joueur.positionX][joueur.positionY] = "";
    check = 0;
  }
  return check;
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

function CreerMap(x, y) { // Créé une map de taille x * y
  map = new Map(x, y);
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
  map[joueur.positionX][joueur.positionY] = "Joueur";
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

  socket.on('demande_map', function(map) {
    x = 9;
    y = 9;
    map = CreerMap(x, y);
    AjouterEnnemi(x, y);
    AjouterEnnemi(x, y);
    AjouterEnnemi(x, y);
    AjouterEnnemi(x, y);
    LocaliserJoueur(joueur, map);
    socket.emit('envoi_map', { mapServeur: map});
    console.log(joueur.positionY);
  });

  socket.on('deplacement_joueur', function(nomTouche) {
    console.log(map);
    if (joueur.enCombat === 0) {

      switch(nomTouche) {

        case "ArrowUp":
        console.log("Le joueur doit aller en haut si possible");
        if (joueur.positionY > 1) {
        //map[joueur.positionX][joueur.positionY] = joueur.positionX + ', ' + joueur.positionY;
        map[joueur.positionX][joueur.positionY] = "";
        joueur.positionY--;
        CheckDeplacementJoueur(map, joueur);
        if (check === 1) {
        socket.emit('nouvel_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi}); // On lui envoie la liste
        }
        socket.emit('envoi_map', { mapServeur: map});
        }
        break;

        case "ArrowRight":
        console.log("Le joueur doit aller à droite si possible");
        if (joueur.positionX < map.xmax) {
        //map[joueur.positionX][joueur.positionY] = joueur.positionX + ', ' + joueur.positionY;
        map[joueur.positionX][joueur.positionY] = "";
        joueur.positionX++;
        CheckDeplacementJoueur(map, joueur);
        if (check === 1) {
        socket.emit('nouvel_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi}); // On lui envoie la liste
        }
        socket.emit('envoi_map', { mapServeur: map});
        }
        break;

        case "ArrowDown":
        console.log("Le joueur doit aller en bas si possible");
        if (joueur.positionY < map.ymax) {
        //map[joueur.positionX][joueur.positionY] = joueur.positionX + ', ' + joueur.positionY;
        map[joueur.positionX][joueur.positionY] = "";
        joueur.positionY++;
        CheckDeplacementJoueur(map, joueur);
        if (check === 1) {
        socket.emit('nouvel_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi}); // On lui envoie la liste
        }
        socket.emit('envoi_map', { mapServeur: map});
        }
        break;

        case "ArrowLeft":
        console.log("Le joueur doit aller à gauche si possible");
        if (joueur.positionX > 1) {
        //map[joueur.positionX][joueur.positionY] = joueur.positionX + ', ' + joueur.positionY;
        map[joueur.positionX][joueur.positionY] = "";
        joueur.positionX--;
        CheckDeplacementJoueur(map, joueur);
        if (check === 1) {
        socket.emit('nouvel_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi}); // On lui envoie la liste
        }
        socket.emit('envoi_map', { mapServeur: map});
        }
        break;
      }
      console.log(nomTouche);
      console.log(map);
    }
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

  socket.on('actualiser', function(data) {
    joueur = data.joueurClient;
    ennemi = data.ennemiClient;
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
  //    joueur.enCombat = 0;
  //    ennemi.xp = 0;
      socket.emit('mort_ennemi', { joueurServeur: joueur, ennemiServeur: ennemi});
      AjouterEnnemi(x, y);
      socket.emit('actualiser', { joueurServeur: joueur, ennemiServeur: ennemi});

  //    ennemi.force = 0;
    }
  });

});

server.listen(8080);
