
var URL = "https://raw.githubusercontent.com/reysi1804/Spotify-/main/pour_jouer.json";

function getTracks() {
  try {
    var response = myspoti.http.get(URL);

    if (!response.ok) {
      return { error: "Erreur GitHub : HTTP " + response.status };
    }

    var data = response.json();

    if (!Array.isArray(data)) {
      return { error: "Le fichier JSON ne contient pas une liste." };
    }

    return {
      tracks: data.filter(function (t) {
        return t &&
          typeof t.title === "string" &&
          Array.isArray(t.artists);
      })
    };
  } catch (e) {
    return { error: "Erreur de chargement : " + String(e) };
  }
}

function trackText(t, i) {
  return {
    type: "text",
    text: (i + 1) + ". " + t.title +
      "\n" + t.artists.join(", "),
    style: "body"
  };
}

myspoti.provide("home", function () {
  var result = getTracks();

  if (result.error) {
    return [{
      title: "Reysi Music",
      blocks: [{
        type: "text",
        text: result.error
      }]
    }];
  }

  var tracks = result.tracks;

  if (!tracks.length) {
    return [{
      title: "Reysi Music",
      blocks: [{
        type: "text",
        text: "Aucun morceau trouvé dans ton catalogue."
      }]
    }];
  }

  var blocks = [];

  for (var i = 0; i < Math.min(tracks.length, 10); i++) {
    blocks.push(trackText(tracks[i], i));
  }

  return [{
    title: "🎵 Reysi Music",
    blocks: [{
      type: "text",
      text: tracks.length + " morceaux disponibles"
    }].concat(blocks)
  }];
});

myspoti.provide("search", function (input) {
  var result = getTracks();
  if (result.error) return [];

  var query = String(input.query || "").toLowerCase();

  return result.tracks
    .filter(function (t) {
      return (
        t.title + " " + t.artists.join(" ")
      ).toLowerCase().indexOf(query) !== -1;
    })
    .slice(0, 4)
    .map(trackText);
});
