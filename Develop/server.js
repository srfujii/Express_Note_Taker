// Dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Sets up the Express App
const app = express();
const PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// Routes
// Root route serves index.html page when user hits our website root
app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// Notes route serves notes.html page when user hits website.com/notes
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

// Retrieves notes from db.json
app.get('/api/notes', (req, res) => {
    
    console.log("Reading db.json file....");

    fs.readFile(`./db/db.json`, (err, data) => {
        if (err) throw err;
        let notes = JSON.parse(data);
        console.log("Parsed Data: " + notes);
        res.json(notes);
    });
});    

app.post('/api/notes', (req, res) => {
    // req.body is equal to the JSON post sent from the user
    // This works because of our body parsing middleware
    let newNote = req.body;

    // Add id key to note object

    fs.readFile(`./db/db.json`, (err, data) => {
        let notesArray = JSON.parse(data);
        newNote.id = notesArray.length + 1;
        notesArray.push(newNote);
        notesArray = JSON.stringify(notesArray, null, 2);
    
        fs.writeFile(`./db/db.json`, notesArray, (err) => {
            if (err) throw err;
            console.log("Data written to file.");
        })
    })
    res.json(newNote);
  });

//  DELETE /api/notes/:id
app.delete('/api/notes/:id', (req, res) => {

    let delNoteId = req.params.id;
    console.log("Deleted Note ID: " + delNoteId);

    if (delNoteId > 0) {
        delNoteId--;
    } else {
        console.log("There are no items to delete.");
    }
    console.log("Deleted Note ID after decrement: " + delNoteId);
    
    fs.readFile(`./db/db.json`, (err, data) => {
        let notesArray = JSON.parse(data);

        // Remove note from array & return/break/done
        notesArray.splice(delNoteId, 1);

        console.log("Notes Array after delete: " + notesArray);

        // Re-number Array
        for (let i=0; i<notesArray.length; i++) {
            notesArray[i].id = i + 1;
        }
        notesArray = JSON.stringify(notesArray, null, 2);

        console.log("Stringified notes array after delete: " + notesArray);
    
        fs.writeFile(`./db/db.json`, notesArray, (err) => {
            if (err) throw err;
            console.log("Data written to file after delete.");
        })
    })
    res.json();
  });


// app.delete....????
//   app.post('/api/clear', (req, res) => {
//     // Empty out the arrays of data
//     tableData.length = 0;
//     waitListData.length = 0;

//     res.json({ ok: true });
//   });
// };
// app.delete('/user', function (req, res) {
//     res.send('Got a DELETE request at /user')
//   })


//   return res.json(false);

// Starts our server listening for requests
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
