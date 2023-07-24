let express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");

let app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let db = "";
main = async () => {
  try {
    db = await mongoose.connect(
      "mongodb+srv://mikeelpro:mIfFGAdUAA8z0pjB@clustersram.axkg095.mongodb.net/siki_db?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("connected to database server...");
  } catch (err) {
    console.log("failed to connect to the database");
  }

  const sikiSchema = new mongoose.Schema({
    zlotyDeszcz: String,
  });
  const Siki = mongoose.model("Siki", sikiSchema);

  const listSchema = new mongoose.Schema({
    name: String,
    listItems: [sikiSchema],
  });
  const List = mongoose.model("List", listSchema);

  let newSikiList = "";

  const sik = new Siki({
    zlotyDeszcz: "Welcome w ciemnej dupie",
  });
  const sik1 = new Siki({
    zlotyDeszcz: "Zrób kupę żeby dodać nowe itemy",
  });
  const sik2 = new Siki({
    zlotyDeszcz: "<--- Zciśnij jaja, żeby spłukać kupę w kibelku",
  });
  const sikiFabryczne = [sik, sik1, sik2];

  app.get("/", (req, res) => {
    Siki.find().then((siki) => {
      if (siki.length === 0) {
        Siki.insertMany(sikiFabryczne);
        res.redirect("/");
      } else res.render("list2", { ListTitle: "Szczam Today", newItems: siki });
    });
  });

  app.get("/:newSikiName", (req, res) => {
    newSikiList = _.upperFirst(req.params.newSikiName);
    const pydaDoGory = _.upperFirst(newSikiList);
    console.log("to newSikiList:", newSikiList);

    if (newSikiList !== "about") {
      if (newSikiList.includes("%20")) {
        res.render("list2", {
          ListTitle: newSikiList,
          listItems: lista.listItems,
        });
      } else {
        List.findOne({ name: newSikiList }).then((lista) => {
          console.log("to lista:", lista);
          if (!lista) {
            const list = new List({
              name: newSikiList,
              listItems: sikiFabryczne,
            });
            list.save();
            res.redirect("/" + newSikiList);
          } else if (lista) {
            res.render("list2", {
              ListTitle: newSikiList,
              newItems: lista.listItems,
            });
          }
        });
      }
    } else if (newSikiList === "about") {
      res.render("about");
    }
  });

  app.post("/", (req, res) => {
    const newUryna = req.body.szczochy;
    const oszczanaTitle = req.body.oszczanaLista;
    console.log(req.body);
    console.log(req.body.szczochy);
    const siki = new Siki({
      zlotyDeszcz: newUryna,
    });
    if (oszczanaTitle === "Szczam Today" && newUryna.length) {
      siki.save();
      res.redirect("/");
    } else if (newUryna.length) {
      List.findOne({ name: oszczanaTitle }).then((foundsiki) => {
        foundsiki.listItems.push(siki);
        foundsiki.save();
        res.redirect(`/` + oszczanaTitle);
      });
    }
  });

  app.post("/del", (req, res) => {
    console.log(req.body.szczyny);
    let oszczanaTitle = req.body.ktorySzczyn;
    let szczochid = req.body.szczyny;
    console.log(req.body);
    const siki = new Siki({
      _id: szczochid,
    });
    if (oszczanaTitle === "Szczam Today") {
      Siki.findByIdAndDelete(szczochid)
        .then((id) => console.log("siki succesfully wytarte"))
        .catch((err) => console.log("zasrane mongoose", err));

      res.redirect("/");
    } else {
      List.findOne({ name: oszczanaTitle })
        .then((foundSiki) => {
          foundSiki.listItems.pull(siki);
          foundSiki.save();
          res.redirect("/" + oszczanaTitle);
        })
        .catch((err) =>
          console.log(
            "cos przzedobrzyles gownianyMaster z tymi sikami:",
            err.message
          )
        );
    }
  });

  app.get("/about", (req, res) => {
    res.render("about");
  });

  app.listen(3000, () =>
    console.log("server is running on port 3000.....................")
  );
};
main().catch((err) =>
  console.log("houston mamy problem kto zaszczal kibel", err.message)
);
