// Dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Sets up the Express App Server
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app server to handle data parsing (middleware)
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
    fs.readFile(`./db/db.json`, (err, data) => {
        if (err) throw err;
        let notes = JSON.parse(data);
        res.json(notes);
    });
});    

// Saves new note
app.post('/api/notes', (req, res) => {
    // req.body is equal to the JSON post sent from the user
    // This works because of our body parsing middleware
    let newNote = req.body;

    fs.readFile(`./db/db.json`, (err, data) => {
        let notesArray = JSON.parse(data);
        // Add id key to note object
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

//  Deletes a note with a specified ID
app.delete('/api/notes/:id', (req, res) => {

    let delNoteId = req.params.id;

    if (delNoteId > 0) {
        delNoteId--;
    } else {
        console.log("There are no items to delete.");
    }
    
    fs.readFile(`./db/db.json`, (err, data) => {
        let notesArray = JSON.parse(data);
        // Remove note from array
        notesArray.splice(delNoteId, 1);

        // Re-number Array
        for (let i=0; i<notesArray.length; i++) {
            notesArray[i].id = i + 1;
        }
        notesArray = JSON.stringify(notesArray, null, 2);
    
        fs.writeFile(`./db/db.json`, notesArray, (err) => {
            if (err) throw err;
            console.log("New reduced data written to file after delete.");
        })
    })
    res.json();
  });

// Starts our server listening for requests
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
