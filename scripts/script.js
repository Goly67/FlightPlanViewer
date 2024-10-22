            let zoomLevel = 1; // Initial zoom level
            let isDragging = false; // For tracking drag status
            let currentX = 0, currentY = 0; // Track current image position
            let initialMouseX, initialMouseY; // Initial mouse position

            const image = document.getElementById('groundChartImage');
            const container = document.getElementById('image-container');

            // Disable default drag behavior of the image
            image.addEventListener('dragstart', (event) => {
                event.preventDefault();
            });

            // Pointer down to start dragging
            image.addEventListener('pointerdown', (event) => {
                if (zoomLevel > 1) {
                    isDragging = true;
                    image.setPointerCapture(event.pointerId); // Capture pointer events for this element
                    image.style.cursor = 'grabbing';

                    initialMouseX = event.clientX;
                    initialMouseY = event.clientY;

                    // Prevent text selection while dragging
                    document.body.style.userSelect = 'none';
                }
            });

            // Pointer up to stop dragging
            image.addEventListener('pointerup', () => {
                isDragging = false;
                image.style.cursor = 'grab';
                // Re-enable text selection
                document.body.style.userSelect = '';
            });

            // Pointer move to handle dragging
            image.addEventListener('pointermove', (event) => {
                if (isDragging) {
                    const dx = event.clientX - initialMouseX;
                    const dy = event.clientY - initialMouseY;

                    // Update current position directly
                    currentX += dx;
                    currentY += dy;

                    // Update image position
                    image.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;

                    // Update initial mouse position
                    initialMouseX = event.clientX;
                    initialMouseY = event.clientY;
                }
            });

            // Function to zoom in
            function zoomIn() {
                zoomLevel = Math.min(zoomLevel + 0.2, 3); // Cap zoom level to 3
                updateImageTransform();
            }

            // Function to zoom out
            function zoomOut() {
                zoomLevel = Math.max(zoomLevel - 0.2, 1); // Minimum zoom level of 1
                updateImageTransform();
            }

            // Update image transform based on zoom
            function updateImageTransform() {
                if (zoomLevel === 1) {
                    // Reset offsets when zooming out to original size
                    currentX = 0;
                    currentY = 0;
                    image.style.transform = 'translate(-50%, -50%) scale(1)';
                } else {
                    image.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
                }
            }

            // Function to handle changing the image
            function updateGroundChart() {
                const selector = document.getElementById('groundChartSelector');
                const selectedValue = selector.value;

                // Update image source
                image.src = selectedValue;

                // Reset zoom level and transform to center
                zoomLevel = 1;
                currentX = 0;
                currentY = 0;
                image.style.transform = 'translate(-50%, -50%) scale(1)';
            }


            function displayFrequency() {
                const dropdown = document.getElementById('frequencyDropdown');
                const selectedFrequency = dropdown.value; // Get selected frequency
                const displayElement = document.getElementById('frequencyDisplay'); // Get the display element

                console.log("Selected Frequency:", selectedFrequency); // Debugging log

                if (selectedFrequency) {
                    displayElement.textContent = `${selectedFrequency}`; // Display selected frequency
                    localStorage.setItem('selectedFrequency', selectedFrequency); // Save to localStorage
                } else {
                    displayElement.textContent = ''; // Clear if nothing selected
                }
            }

            window.onload = function () {
                // Check if there's a saved selection in localStorage
                const savedFrequency = localStorage.getItem('selectedFrequency');
                console.log("Saved Frequency from localStorage:", savedFrequency); // Debugging log

                if (savedFrequency) {
                    const dropdown = document.getElementById('frequencyDropdown');
                    dropdown.value = savedFrequency; // Set the dropdown to the saved value
                    displayFrequency(); // Display the saved frequency
                }
            };

            function updateGroundChart() {
                const selector = document.getElementById('groundChartSelector');
                const image = document.getElementById('groundChartImage');
                const selectedValue = selector.value;

                // Update the image source based on the selected option
                image.src = selectedValue;

                // Save the selected option to localStorage
                localStorage.setItem('selectedGroundChart', selectedValue);
            }

            window.onload = function () {
                // Check if there's a saved selection in localStorage
                const savedValue = localStorage.getItem('selectedGroundChart');
                if (savedValue) {
                    const selector = document.getElementById('groundChartSelector');
                    selector.value = savedValue; // Set the selector to the saved value
                    updateGroundChart(); // Update the image based on the saved value
                }
            };


            function displayFlightPlans() {
                const flightPlansList = document.getElementById('flightPlansList');
                const flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
                if (flightPlans.length === 0) {
                    flightPlansList.innerHTML = '<p class="no-plans">No flight plans submitted yet.</p>';
                    return;
                }
                flightPlansList.innerHTML = flightPlans.map(plan => `
        <div class="flight-plan">
            <h3>${plan.callsign} - ${plan.departure} to ${plan.arrival}</h3>
            <p><strong>Aircraft:</strong> ${plan.aircraft}</p>
            <p><strong>Flight Rule Type:</strong> ${plan.flightRule}</p>
            <p><strong>SID:</strong> ${plan.sid}</p>
            <p><strong>Cruising Level:</strong> ${plan.cruisingLevel}</p>
            <p><strong>Squawk:</strong> ${plan.squawk || 'Not assigned'}</p>
        </div>
    `).join('');
            }

            function displayNotes() {
                const notesList = document.getElementById('notesList');
                const notes = JSON.parse(localStorage.getItem('notes')) || [];

                if (notes.length === 0) {
                    notesList.innerHTML = '<p class="no-notes">No notes added yet.</p>';
                    return;
                }

                notesList.innerHTML = `
        <ul class="notes-list">
            ${notes.map((note, index) => `
                <li class="note-item">
                    <span class="note-text">${note}</span> 
                    <button class="edit-note" onclick="editNote(${index})">Edit</button>
                    <button class="delete-note" onclick="deleteNote(${index})">Delete</button>
                    <div class="edit-container" style="display: none;"> 
                        <input type="text" id="editNote-${index}" value="${note}">
                        <button class="update-note" onclick="updateNote(${index})">Update</button>
                        <button class="cancel-edit" onclick="cancelEdit(${index})">Cancel</button>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
            }

            function addNote() {
                const newNoteInput = document.getElementById('newNote');
                const noteText = newNoteInput.value.trim();

                if (noteText) {
                    const notes = JSON.parse(localStorage.getItem('notes')) || [];
                    notes.push(noteText);
                    localStorage.setItem('notes', JSON.stringify(notes));
                    newNoteInput.value = '';
                    displayNotes();
                }
            }

            document.getElementById('newNote').addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    addNote(); // Call the addNote function when Enter is pressed
                }
            });

            document.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    const editInputs = document.querySelectorAll('.edit-container input');
                    editInputs.forEach((input, index) => {
                        if (input === event.target) {
                            updateNote(index);
                        }
                    });
                }
            });

            function deleteNote(index) {
                const notes = JSON.parse(localStorage.getItem('notes')) || [];

                notes.splice(index, 1);
                localStorage.setItem('notes', JSON.stringify(notes));

                displayNotes(); // Call displayNotes after deletion to refresh the UI
            }

            function updateNote(index) {
                const notes = JSON.parse(localStorage.getItem('notes')) || [];
                const noteItem = document.querySelectorAll('.note-item')[index];
                const originalNote = noteItem.querySelector('.note-text').textContent.trim(); // Get the original note text

                notes[index] = originalNote; // Update the note in localStorage with the original text
                localStorage.setItem('notes', JSON.stringify(notes));

                cancelEdit(index); // Hide the edit input and show the updated text
            }

            function editNote(index) {
                const noteItem = document.querySelectorAll('.note-item')[index];
                const noteText = noteItem.querySelector('.note-text');
                const editContainer = noteItem.querySelector('.edit-container');
                const editInput = noteItem.querySelector(`#editNote-${index}`); // Get the edit input field
                const editButton = noteItem.querySelector('.edit-note');
                const deleteButton = noteItem.querySelector('.delete-note');

                // Toggle visibility of elements
                noteText.style.display = 'none';
                editContainer.style.display = 'flex';

                // Hide the Edit and Delete buttons while editing
                editButton.style.display = 'none';
                deleteButton.style.display = 'none';

                // Focus the edit input
                editInput.focus();
                editInput.setSelectionRange(editInput.value.length, editInput.value.length); // Set cursor at the end
            }

            function updateNote(index) {
                const notes = JSON.parse(localStorage.getItem('notes')) || [];
                const noteItem = document.querySelectorAll('.note-item')[index];
                const updatedNote = noteItem.querySelector(`#editNote-${index}`).value.trim(); // Get the updated note text

                if (updatedNote === "") {
                    // If the updated note is empty, delete it
                    deleteNote(index);
                } else {
                    // Update the note in localStorage
                    notes[index] = updatedNote;
                    localStorage.setItem('notes', JSON.stringify(notes));

                    // Update the UI with the new note text
                    const noteText = noteItem.querySelector('.note-text');
                    noteText.textContent = updatedNote;

                    // Hide the edit input and show the updated note
                    cancelEdit(index);  // Call cancelEdit to hide the input and show the updated text
                }
            }

            function cancelEdit(index) {
                const noteItem = document.querySelectorAll('.note-item')[index];
                const noteText = noteItem.querySelector('.note-text');
                const editContainer = noteItem.querySelector('.edit-container');
                const editButton = noteItem.querySelector('.edit-note');
                const deleteButton = noteItem.querySelector('.delete-note');

                // Restore visibility of the note text and hide the input field
                noteText.style.display = 'block';
                editContainer.style.display = 'none';

                // Show the Edit and Delete buttons again
                editButton.style.display = 'inline-block';
                deleteButton.style.display = 'inline-block';
            }


            function cancelEdit(index) {
                const noteItem = document.querySelectorAll('.note-item')[index];
                const noteText = noteItem.querySelector('.note-text');
                const editContainer = noteItem.querySelector('.edit-container');
                const editButton = noteItem.querySelector('.edit-note');
                const deleteButton = noteItem.querySelector('.delete-note');

                noteText.style.display = 'block';
                editContainer.style.display = 'none';

                editButton.style.display = 'block';
                deleteButton.style.display = 'block';
            }

            function copyServer() {
                const textToCopy = '31xxRy8Zpy'; // Server code to copy
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Server code copied to clipboard: ' + textToCopy);
                });
            }

            function copyPassword() {
                const textToCopy = 'PUBLICATC'; // Password to copy
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Password copied to clipboard: ' + textToCopy);
                });
            }

            function copyAtis() {
                const atisText = `Gran Canaria (GCLP)\n\nGCLP_APP [121.300]: @xaie9\n\n[**[CLICK HERE TO FILL UP FLIGHT PLAN]**](https://forms.gle/WfpsCb9wpCvrbcSc6)\n\n`;
                navigator.clipboard.writeText(atisText).then(() => {
                    alert('ATIS copied to clipboard.');
                });
            }

            // Function to save flight plan with a timestamp
            function saveFlightPlan(flightPlan) {
                const flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
                const timestamp = Date.now(); // Get the current time

                flightPlan.timestamp = timestamp; // Add timestamp to the flight plan
                flightPlans.push(flightPlan);
                localStorage.setItem('flightPlans', JSON.stringify(flightPlans));

                // Automatically remove the flight plan after 25 minutes (1500000 milliseconds)
                setTimeout(() => {
                    deleteExpiredFlightPlans();
                    displayFlightPlans();
                }, 1500000); // 25 minutes

                displayFlightPlans(); // Refresh UI
            }

            // Function to delete expired flight plans
            function deleteExpiredFlightPlans() {
                const flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
                const currentTime = Date.now();

                // Keep flight plans that were added within the last 25 minutes
                const validFlightPlans = flightPlans.filter(plan => (currentTime - plan.timestamp) < 1500000);

                localStorage.setItem('flightPlans', JSON.stringify(validFlightPlans));
            }

            // Check and delete expired flight plans on page load
            window.onload = function () {
                deleteExpiredFlightPlans(); // Remove expired flight plans when page loads
            };

            // Initial display
            displayFlightPlans();
            displayNotes();