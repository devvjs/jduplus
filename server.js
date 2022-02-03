const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
app.use(express.json());
app.use(express.static("public"));

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var prodwsurl = "https://prod.just-dance.com";
var room = "MainJD2019";

// Songs
const SKUPackages = require("./packages/sku-packages.json");
const SongDB_19 = require("./data/db/songs_nx19.json");
const SongDB_18 = require("./data/db/songs_nx18.json");
const SongDB_17 = require("./data/db/songs_nx17.json");
const PJSONCarousel = require("./carousel/party-carousel.json");

// Avatars, Quests and Bosses.
const CustomDB = require("./data/db/items.json");
const Quest = require("./data/db/quests.json");
const QJSONCarousel = require("./carousel/pages/aa-quests.json");
const Bosses = require("./wdf/online-bosses.json");

// V1, V2 and V3
const v1 = require("./v1/configuration.json");
const v2 = require("./v2/entities.json");
const v3 = require("./v3/users/1b5f3c8c-4072-4d13-af9e-f47d7a6e8021.json");

// Others
const DM = require("./data/dm/blocks.json");
const SKUConstants = require("./constant-provider/v1/sku-constants.json");
const WDF = require("./wdf/assign-room.json");
const Ping = require("./data/ping.json");
const COM = require("./com-video/com-videos-fullscreen.json");
const Pages = require("./carousel/pages/upsell-videos.json");
const CarouselPackages = require("./carousel/packages.json");
const Time = require("./wdf/server-time.json");
const Subs = require("./data/refresh.json");
const jdtvfile = require("./data/jdtv.json");

app.get("/packages/:version/sku-packages", function (request, response) {
  response.send(SKUPackages);
});

app.get("/aaaaaa", function (request, response) {
  var popa = request.postData.params[1]
  response.send(popa);
});


app.get("/songdb/:version/songs", function (request, response) {
  var skuid = request.header("X-SkuId");
  if (skuid == `jd2019-nx-all`){
    response.send(SongDB_19);
  } else if (skuid == `jd2018-nx-all`){
    response.send(SongDB_18);
  } else if (skuid == `jd2017-nx-all`){
    response.send(SongDB_17);
  } else {
    response.send(SongDB_19);
  }
  
});

app.get("/dance-machine/v1/blocks", function (request, response) {
  response.send(DM);
});

// app.post("/carousel/v2/pages/quests", function(request, response) {
//   response.send(QJSONCarousel);
// });

app.post("/carousel/:version/pages/party", function (request, response) {
  var skuid = request.header("X-SkuId");
  if (skuid == `jd2019-nx-all`){
    response.send(PJSONCarousel);
  } else if (skuid == `jd2018-nx-all`){
    response.send(PJSONCarousel);
  } else if (skuid == `jd2017-nx-all`){
    response.send(PJSONCarousel);
  } else {
    response.send(`Unauthorized`); 
  }
});

app.post("/carousel/v2/pages/dancerprofile", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/carousel/v2/pages/dancerprofile",
    method: "POST",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all"
    }
  };
  redirect(httpsopts, req.body, function (redResponse) {
    res.send(redResponse);
  });
});

app.post("/carousel/v2/pages/friend-dancerprofile", (req, res) => {
  var json = JSON.stringify(req.body);
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/carousel/v2/pages/friend-dancerprofile?pid=" + req.query.pid,
    method: "POST",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all"
    }
  };
  redirect(httpsopts, json, function (redResponse) {
    res.send(redResponse);
  });
});

app.get("/questdb/v1/quests", function (request, response) {
  response.send(Quest);
});

app.get("/status/v1/ping", function (request, response) {
  response.send(Ping);
});

app.get("/customizable-itemdb/v1/items", function (request, response) {
  response.send(CustomDB);
});

app.get("/com-video/v1/com-videos-fullscreen", function (request, response) {
  response.send(COM);
});

app.get("/constant-provider/v1/sku-constants", (req, res) => {
  res.send(SKUConstants);
});

app.post("/carousel/v2/pages/upsell-videos", function (request, response) {
  response.send(Pages);
});


app.post("/subscription/v1/refresh", function (request, response) {
  response.send({
    validity: true,
    errorCode: "",
    timeLeft: 99999999999,
    expiryTimeStamp: "99999999999",
    platformId: "4b93827a-01c6-405b-b4b3-67590ef4b47b",
    trialActivated: false,
    consoleHasTrial: true,
    trialTimeLeft: 0,
    trialDuration: "90",
    trialIsActive: false,
    needEshopLink: false,
    autoRefresh: false
  });
});

app.get("/content-authorization/:version/maps/*", (req, res) => {
  var ss = req.url.split("/").pop();
  const path = "./videos/" + ss + ".json";
  const skuId = req.header("x-skuid");
  var ticket = req.header("Authorization");
  
  var fileurls = require("./videos/" + ss + ".json");
  res.send(fileurls);
});




app.get("/profile/v2/profiles", (req, response) => {
  var ticket = req.header("Authorization");
  var skuid = req.header("X-SkuId");
  var profilesid = req.url.split('/profile/v2/profiles?profileIds=')[1]
  const check_if_profilesid = fs.existsSync(
    "./v3/users/" + profilesid + ".json"
  );
  if (check_if_profilesid) {
    const data_profilesid = JSON.parse(fs.readFileSync("./v3/users/" + profilesid + ".json"));
    response.send(data_profilesid);
  } else if (check_if_profilesid == false) {
    var file = ([{
      "name": "Noname",
      "nickname": "Noname",
      "avatar": 3900,
      "country": 0,
      "skin": 0,
      "alias": 0,
      "aliasGender": -1,
      "portraitBorder": 0,
      "jdPoints": 0,
      "progression": {},
      "scores": {},
      "unlockedAvatars": [],
      "unlockedSkins": [],
      "unlockedAliases": [],
      "unlockedPortraitBorders": [],
      "wdfRank": 0,
      "stars": 0,
      "unlocks": 0,
      "songsPlayed": 0,
      "platformId": "8928356598309773519",
      "populations": [],
      "language": "en",
      "firstPartyEnv": "lp1",
      "history": {},
      "favorites": [],
      "syncVersions": {},
      "otherPids": [],
      "stats": {},
      "mapHistory": {},
      "diamondPoints": 0,
      "inProgressAliases": [],
      "profileId": "fb333c75-e7a3-4cd9-93af-911a9027df45",
      "ticket": ticket
    }])
    response.send(file)
    var file1 = JSON.stringify(file);
    fs.writeFileSync("./v3/users/" + profilesid + ".json", file1, function (err) {
      console.log(err);
    });
  } else {
    response.send(`No`)
  }
});

app.post("/profile/v2/profiles", (req, response) => {
  var ticket = req.header("Authorization");
  var skuid = req.header("X-SkuId");
  var profilesid = req.url.split('/profile/v2/profiles?profileIds=')[1]
  var content = req.body
  var content2 = content+ticket;
  var file1 = JSON.stringify(content2);
  fs.writeFileSync("./v3/users/" + profilesid + ".json", file1, function (err) {
    console.log(err);
  });

  response.send(file1)
});

// v1
app.get("/:version/applications/:appid/configuration", function (
  request,
  response
) {
  response.send(v1);
});

// v2
app.get("/:version/spaces/:spaceid/entities", function (request, response) {
  response.send(v2);
});

// v3
app.get("/:version/users/:user", (req, res) => {
  var auth = req.header("Authorization");
  var sessionid = req.header("Ubi-SessionId");
  const httpsopts = {
    hostname: "public-ubiservices.ubi.com",
    port: 443,
    path: "/v3/users/" + req.params.user,
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "ubi-appbuildid": "BUILDID_259645",
      "Ubi-AppId": req.header("Ubi-AppID"),
      "Ubi-localeCode": "en-us",
      "Ubi-Populations": "US_EMPTY_VALUE",
      "Ubi-SessionId": sessionid
    }
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

app.get("/leaderboard/v1/coop_points/mine", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/leaderboard/v1/coop_points/mine",
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all"
    }
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

// packages
app.post("/carousel/:version/packages", function (request, response) {
  response.send(CarouselPackages);
});

app.post("/:version/users/:user", (req, res) => {
  var auth = req.header("Authorization");
  var sessionid = req.header("Ubi-SessionId");
  const httpsopts = {
    hostname: "public-ubiservices.ubi.com",
    port: 443,
    path: "/v3/users/" + req.params.user,
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "ubi-appbuildid": "BUILDID_259645",
      "Ubi-AppId": "341789d4-b41f-4f40-ac79-e2bc4c94ead4",
      "Ubi-localeCode": "en-us",
      "Ubi-Populations": "US_EMPTY_VALUE",
      "Ubi-SessionId": sessionid
    }
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});
app.post("/wdf/v1/assign-room", (req, res) => {
  res.send({
    room: room
  });
});

app.post("/wdf/:version/rooms/" + room + "/*", (req, res) => {
  var ticket = req.header("Authorization");
  var xhr = new XMLHttpRequest();
  var result = req.url.substr(0);
  xhr.open("POST", prodwsurl + result, false);
  xhr.setRequestHeader("X-SkuId", "jd2019-nx-all");
  xhr.setRequestHeader("Authorization", ticket);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(req.body, null, 2));
  res.send(xhr.responseText);
});

app.get("/wdf/:version/rooms/" + room + "/*", (req, res) => {
  var ticket = req.header("Authorization");
  var xhr = new XMLHttpRequest();
  var result = req.url.substr(0);
  xhr.open("GET", prodwsurl + result, false);
  xhr.setRequestHeader("X-SkuId", "jd2019-nx-all");
  xhr.setRequestHeader("Authorization", ticket);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(req.body, null, 2));
  res.send(xhr.responseText);
});

app.get("/wdf/v1/online-bosses", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/wdf/v1/online-bosses",
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "X-SkuId": "jd2019-nx-all"
    }
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});
app.get("/wdf/v1/server-time", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/wdf/v1/server-time",
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "X-SkuId": "jd2019-nx-all"
    }
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

// v3/profiles/sessions
app.post("/:version/profiles/sessions", (req, res) => {
  var json = JSON.stringify({});
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "public-ubiservices.ubi.com",
    port: 443,
    path: "/v3/profiles/sessions",
    method: "POST",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "ubi-appbuildid": "BUILDID_259645",
      "Ubi-AppId": "740a6dc8-7d7a-4fbe-be2c-aa5d8c65c5e8",
      "Ubi-localeCode": "en-us",
      "Ubi-Populations": "US_EMPTY_VALUE"
    }
  };
  redirect(httpsopts, json, function (redResponse) {
    var responsepar = JSON.parse(redResponse);
    res.send(responsepar);
  });
});

app.post("/home/v1/tiles", function (request, response) {
  response.send(require('./data/home/tiles.json'));
});

app.get("/profile/v2/country", function (request, response) {
  response.send({
    country: "RU"
  });
});

app.get("/playlistdb/v1/playlists", function (request, response) {
  response.send({
    __class: "PlaylistDbResponse",
    db: {
      "reco-top_country": {
        maps: ["MadLove", "Intoxicated"],
        colors: {
          base_color: "BD01ABFF",
          grad_color: "69C2E0FF"
        },
        type: "recommended",
        __class: "PlaylistDbService::Playlist",
        title: "Server the bitch",
        description: "The most popular songs in your country",
        fixedMapOrder: false,
        fallback: false,
        pinned: false
      }
    }
  });
});

app.get("/session-quest/v1/", function (request, response) {
  response.send(
    '{ "__class": "SessionQuestService::QuestData", "newReleases": [] }'
  );
});

app.post("/profile/*/filter-players", (req, res) => {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", prodwsurl + "/profile/v2/filter-players", false);
  xhr.setRequestHeader("X-SkuId", "jd2019-nx-all");
  xhr.setRequestHeader("Authorization", req.header("Authorization"));
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(req.body, null, 2));
  res.send(xhr.responseText);
});

app.get("/leaderboard/v1/maps/:map/dancer-of-the-week", function (request, response) {
  var xhr = new XMLHttpRequest();
  var ticket = request.header("Authorization");
  var appid = request.header("X-SkuId");

  const checkFile = fs.existsSync(
    "./data/leaderboard/v1/maps/" + request.params.map + ".json"
  );
  if (checkFile) {
    const readFile = fs.readFileSync(
      "./data/leaderboard/v1/maps/" + request.params.map + ".json"
    );
    response.send(readFile);
  } else {
    response.send({
      "__class": "DancerOfTheWeek"
    })
  }

});

app.post("/profile/v2/map-ended", (req, res) => {
  var auth = req.header("Authorization");
  var codename = req.body
  for (let i = 0; i < codename.length; i++) {
    var song = codename[i];
  }
  const readFile = fs.readFileSync("./data/leaderboard/v1/maps/" + song.mapName + ".json");
  var JSONParFile = JSON.parse(readFile)
  if (JSONParFile.score > song.score) {
    res.send(`1`)
  } else {
    var ticket = req.header("Authorization");
    var xhr33 = new XMLHttpRequest();
    xhr33.open(req.method, prodwsurl + req.url, true);
    xhr33.setRequestHeader("X-SkuId", "jd2019-nx-all");
    xhr33.setRequestHeader("Authorization", ticket);
    xhr33.setRequestHeader("Content-Type", "application/json");
    xhr33.send(JSON.stringify(req.body), null, 2);

    var getprofil1 = xhr33.responseText.toString();
    console.log(getprofil1)
    for (let i = 0; i < getprofil1.length; i++) {
      var profiljson = getprofil1[i];
    }
    console.log(profiljson)
    res.send(profiljson)
    // var profiljson1 = JSON.parse(profiljson)
    // var jsontodancerweek = ({
    //   "__class": "DancerOfTheWeek",
    //   "score": song.score,
    //   "profileId": profiljson1.profileId,
    //   "gameVersion": "jd2019",
    //   "rank": 1,
    //   "name": profiljson1.name,
    //   "avatar": profiljson1.avatar,
    //   "country": profiljson1.country,
    //   "platformId": "2535467426396224",
    //   "alias": profiljson1.alias,
    //   "aliasGender": profiljson1.aliasGender,
    //   "jdPoints": profiljson1.jdPoints,
    //   "portraitBorder": profiljson1.portraitBorder
    // })
    // fs.writeFile("./data/leaderboard/v1/maps/" + song.mapName + ".json", jsontodancerweek, function (err) {
    //   if (err) {
    //     console.log(err);
    //     res.send(object)
    //   } else {
    //     console.log("Файл создан");
    //     res.send(object)
    //   }
    // });
  }
});

app.get("/aliasdb/v1/aliases", function (request, response) {
  response.send({
    __class: "OnlineAliasDb",
    aliases: {}
  });
});

app.post("/carousel/v2/pages/jd2019-playlists", (request, response) => {
  response.send({
    __class: "JD_CarouselContent",
    categories: [{
        __class: "Category",
        title: "Recommended",
        act: "ui_carousel",
        isc: "grp_row",
        categoryType: "playlist",
        items: [{
          __class: "Item",
          isc: "grp_row",
          act: "ui_carousel",
          actionList: "_None",
          actionListUpsell: "_None",
          components: [{
            __class: "JD_CarouselContentComponent_Playlist",
            playlistID: "reco-top_country",
            displayCode: 1,
            displayMethod: "manual"
          }]
        }]
      },
      {
        __class: "Category",
        title: "Themed Playlists",
        act: "ui_carousel",
        isc: "grp_row",
        categoryType: "playlist",
        items: []
      }
    ],
    actionLists: {
      _None: {
        __class: "ActionList",
        actions: [{
          __class: "Action",
          title: "None",
          type: "do-nothing"
        }],
        itemType: "map"
      }
    },
    songItemLists: {}
  });
});

app.post("/carousel/v2/pages/jdtv-nx", function (request, response) {
  response.send(jdtvfile);
});

// app.get("/*", (req, res) => {
//   res.send("{}");
// });

// listen for requests :)
const listener = app.listen(process.env.PORT = 80, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

// Función para redireccionar a otros sitios
// Es necesario un options que contiene los detalles de ruta, la manera (GET, POST) y la dirección
function redirect(options, write, callback) {
  var Redirect = https.request(options, response => {
    response.on("data", data => {
      callback(data);
    });
  });
  Redirect.on("error", e => {
    console.log(e);
  });
  Redirect.write(write);
  Redirect.end();
}