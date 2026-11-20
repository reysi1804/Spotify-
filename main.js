
var URL = "https://raw.githubusercontent.com/reysi1804/Spotify-/c550a1eaf0c41216dc2e1511eb83464fa669bdaa/pour_jouer.json";

function getTracks() {
  try {
    var response = myspoti.http.get(URL);

    if (!response.ok) return [];

    // Important : json est une propriété, pas une fonction
    var data = response.json();

    if (!Array.isArray(data)) return [];

    return data.filter(function (t) {
      return t &&
        typeof t.title === "string" &&
        Array.isArray(t.artists);
    });
  } catch (e) {
    myspoti.log("Erreur Reysi Music : " + e);
    return [];
  }
}

function makeCard(track, index) {
  return {
    type: "card",
    title: track.title,
    subtitle: track.artists.join(", ") +
      (track.length ? " • " +
      Math.floor(track.length / 60) + ":" +
      String(track.length % 60).padStart(2, "0") : ""),
    action: "track_" + index
  };
}

myspoti.provide("home", function () {
  var tracks = getTracks();

  if (!tracks.length) {
    return [{
      type: "section",
      title: "Reysi Music",
      blocks: [{
        type: "text",
        text: "Aucun morceau trouvé. Vérifie le catalogue GitHub."
      }]
    }];
  }

  return [{
    type: "section",
    title: "Reysi Music 🎵",
    subtitle: tracks.length + " morceaux",
    blocks: tracks.slice(0, 12).map(makeCard)
  }];
});

myspoti.provide("search", function (input) {
  var tracks = getTracks();
  var q = String(input.query || "").toLowerCase();

  return tracks
    .filter(function (t) {
      return (t.title + " " + t.artists.join(" "))
        .toLowerCase().indexOf(q) !== -1;
    })
    .slice(0, 4)
    .map(makeCard);
});

myspoti.provide("tap", function (event) {
  var action = String(event.action || "");

  if (action.indexOf("track_") !== 0) return;

  var index = Number(action.substring(6));
  var track = getTracks()[index];

  if (track) {
    myspoti.notify(
      "Recherche dans Spotify : " +
      track.title + " - " + track.artists.join(", ")
    );
  }
});
