document.getElementById('assign-note').addEventListener('click', () => {
    const noteBody = document.getElementById('note-body').value;
    
    // Create a new div container for the note
    const noteContainer = document.createElement('div');
    noteContainer.classList.add('note-container');
    
    // Create a new paragraph element for the note body
    const noteElement = document.createElement('p');
    noteElement.textContent = noteBody;
    
    // Append the note body to the container
    noteContainer.appendChild(noteElement);
    
    // Append the note container to the notes-container section
    document.getElementById('notes-container').appendChild(noteContainer);
    
    // Save the note to the NoteDb.json file
    saveNoteToFile(noteBody, req.session.username);
});
