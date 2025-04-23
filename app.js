// // Check if the user is logged in, if not redirect to login page
if (!localStorage.getItem('userId')) {
    window.location.href = 'login.html';
  }
  
  // Handle settings menu toggle (displaying it when clicking the button)
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const menu = document.getElementById('settingsMenu');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
  });
  
  // Optional: Hide settings menu if clicked anywhere else
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#settingsBtn') && !e.target.closest('#settingsMenu')) {
      document.getElementById('settingsMenu').style.display = 'none';
    }
  });
  
  // Logout function
  function logout() {
    localStorage.removeItem('userId');
    window.location.href = 'login.html';  // Redirect to login page after logout
  }
  
  // Function to fetch events from the server
  async function fetchEvents() {
    const userId = localStorage.getItem('userId');
    if (!userId) return window.location.href = 'login.html';

    const res = await fetch(`http://localhost:3000/events?userId=${userId}`);
    const data = await res.json();
    
    console.log("Fetched Events:", data); // Debugging: log the fetched data
    document.getElementById('notes').innerHTML = '';
  
    data.forEach(e => {
      let dateTimeString = `${e.date}T${e.time}`.replace(/\s/g, '');
      if (dateTimeString.endsWith('Z')) {
        dateTimeString = dateTimeString.slice(0, -1); // Remove the 'Z'
      }
      console.log("Generated DateTime String:", dateTimeString);

      const fullDateTime = new Date(e.date);  // This was working before
if (isNaN(fullDateTime)) {
  console.error("Invalid Date:", e.date);
  return;
}

const formattedDate = fullDateTime.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// NEW: Separate time parsing
const [hour, minute] = e.time.split(':');
const timeObj = new Date();
timeObj.setHours(hour, minute);
const formattedTime = timeObj.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});


  
      // Assigning formatted date and time to variables
      const div = document.createElement('div');
      div.className = `note ${e.highlight_class || ''}`;
      div.innerHTML = `
        <strong contenteditable="true" class="editable-title">${e.title}</strong><br>
        <div contenteditable="true" class="editable-desc">${e.description}</div><br>
        <em>${formattedTime}</em><br>
        <em>${formattedDate}</em><br>
        <button onclick="saveEdit(${e.id}, this)">Save</button>
        <button onclick="deleteEvent(${e.id})">Delete</button>
        <button onclick="highlightEvent(${e.id})">Highlight</button>
      `;

      document.getElementById('notes').appendChild(div);
    });
  }
  
  // Function to add a new event
  async function addEvent() {
    const userId = localStorage.getItem('userId');
    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('desc').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      group_name: document.getElementById('group').value,  // Group comes from dropdown
      recurrence: document.getElementById('recurrence').value,
      userId
    };
  
    console.log("Event Data:", data);
  
    try {
      const res = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      if (res.ok) {
        alert("Event added!");
        fetchEvents();  // Refresh events list
      } else {
        alert("Failed to add event.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error adding event.");
    }
  }
  
  // Function to delete an event
  async function deleteEvent(id) {
    await fetch(`http://localhost:3000/events/${id}`, { method: 'DELETE' });
    fetchEvents();  // Refresh events list after deletion
  }
  
  // Function to highlight an event
  // Function to highlight an event
const highlightColors = ['highlight-orange', 'highlight-purple', 'highlight-green', 'highlight-red', 'highlight-blue'];

async function highlightEvent(id) {
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`http://localhost:3000/events?userId=${userId}`);
      const events = await res.json();
  
      if (!Array.isArray(events)) {
        console.error('Invalid response:', events);
        return;
      }
  
      const event = events.find(e => e.id === id);
      if (!event) {
        console.error('Event not found!');
        return;
      }
  
      const highlightColors = ['highlight-orange', 'highlight-purple', 'highlight-green', 'highlight-red', 'highlight-blue'];
      const currentColor = event.highlight_class || '';
      const currentIndex = highlightColors.indexOf(currentColor);
      const nextColor = highlightColors[(currentIndex + 1) % highlightColors.length];
  
      await fetch(`http://localhost:3000/events/${id}/highlight`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlight_class: nextColor })
      });
  
      fetchEvents(); // Refresh UI
    } catch (err) {
      console.error("Error highlighting event:", err);
    }
  }

  async function saveEdit(id, btn) {
    const noteDiv = btn.parentElement;
    const newTitle = noteDiv.querySelector('.editable-title').innerText.trim();
    const newDesc = noteDiv.querySelector('.editable-desc').innerText.trim();
  
    const res = await fetch(`http://localhost:3000/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc })
    });
  
    if (res.ok) {
      alert("Changes saved!");
      fetchEvents(); // Refresh
    } else {
      alert("Error saving changes.");
    }
  }
  
  

  
  
  // Fetch the events when the page loads
  fetchEvents();
