const firebaseConfig = {
  apiKey: "AIzaSyCKnOlLJNeMzmALZdCPvwfDY8Yi9H8GGeA",
  authDomain: "crud-6beef.firebaseapp.com",
  projectId: "crud-6beef",
  storageBucket: "crud-6beef.appspot.com",
  messagingSenderId: "378475669194",
  appId: "1:378475669194:web:0cb6267370cbea904bf633",
  measurementId: "G-7KMCJRF9T2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const personForm = document.getElementById('personForm');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const genderInput = document.getElementById('gender');
const addressInput = document.getElementById('address');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const peopleList = document.getElementById('peopleList');
const personIdInput = document.getElementById('personId');
const toggleTableBtn = document.getElementById('toggleTableBtn');
const dataContainer = document.getElementById('dataContainer');

let editingId = null;
let isTableVisible = false;
const heroesRef = db.collection('student');

document.addEventListener('DOMContentLoaded', function() {
  toggleTableBtn.querySelector('span').textContent = 'SHOW STUDENT';
  toggleTableBtn.addEventListener('click', toggleTable);
  personForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', cancelEdit);
  
  dataContainer.style.display = 'none';
});

function toggleTable() {
  isTableVisible = !isTableVisible;
  
  if (isTableVisible) {
    dataContainer.style.display = 'block';
    toggleTableBtn.querySelector('span').textContent = 'HIDE STUDENT';
    renderHeroes();
  } else {
    dataContainer.style.display = 'none';
    toggleTableBtn.querySelector('span').textContent = 'SHOW STUDENT';
  }
}

function renderHeroes() {
  peopleList.innerHTML = '';
  
  heroesRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    peopleList.innerHTML = '';
    
    snapshot.forEach(doc => {
      const student = doc.data();
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.age}</td>
        <td>${student.gender}</td>
        <td>${student.address}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${doc.id}">EDIT</button>
          <button class="action-btn delete-btn" data-id="${doc.id}">DELETE</button>
        </td>
      `;
      
      peopleList.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  }, error => {
    showToast('Error loading student data: ' + error.message, 'error');
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const age = ageInput.value;
  const gender = genderInput.value;
  const address = addressInput.value.trim();

  if (!name || !age || !gender || !address) {
    showToast('Please fill all fields', 'error');
    return;
  }

  try {
    if (editingId !== null) {
      await heroesRef.doc(editingId).update({
        name,
        age,
        gender,
        address,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('Student updated successfully!', 'success');
    } else {
      await heroesRef.add({
        name,
        age,
        gender,
        address,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('Student added successfully!', 'success');
    }
    
    personForm.reset();
    editingId = null;
    submitBtn.querySelector('span').textContent = 'ADD STUDENT';
    cancelBtn.style.display = 'none';
    
  } catch (error) {
    console.error("Error: ", error);
    showToast('Operation failed: ' + error.message, 'error');
  }
}

async function handleEdit(e) {
  const id = e.target.getAttribute('data-id');
  
  try {
    const doc = await heroesRef.doc(id).get();
    if (doc.exists) {
      const heroToEdit = doc.data();
      nameInput.value = heroToEdit.name;
      ageInput.value = heroToEdit.age;
      genderInput.value = heroToEdit.gender;
      addressInput.value = heroToEdit.address;
      personIdInput.value = doc.id;
      
      editingId = doc.id;
      submitBtn.querySelector('span').textContent = 'UPDATE STUDENT';
      cancelBtn.style.display = 'inline-block';
      
      showToast('Student loaded for editing', 'info');
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
      
      if (!isTableVisible) {
        toggleTable();
      }
    }
  } catch (error) {
    console.error("Error getting document:", error);
    showToast('Failed to load student: ' + error.message, 'error');
  }
}

async function handleDelete(e) {
  const id = e.target.getAttribute('data-id');
  
  if (confirm('Are you sure you want to delete this student?')) {
    try {
      await heroesRef.doc(id).delete();
      showToast('Student deleted successfully!', 'success');
      
      if (editingId === id) {
        personForm.reset();
        editingId = null;
        submitBtn.querySelector('span').textContent = 'ADD STUDENT';
        cancelBtn.style.display = 'none';
      }
    } catch (error) {
      console.error("Error removing document: ", error);
      showToast('Failed to delete student: ' + error.message, 'error');
    }
  }
}

function cancelEdit() {
  personForm.reset();
  editingId = null;
  submitBtn.querySelector('span').textContent = 'ADD STUDENT';
  cancelBtn.style.display = 'none';
  showToast('Edit cancelled', 'info');
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}