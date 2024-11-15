

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function(e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  /**
   * Initiate quill editors
   */
  if (select('.quill-editor-default')) {
    new Quill('.quill-editor-default', {
      theme: 'snow'
    });
  }

  if (select('.quill-editor-bubble')) {
    new Quill('.quill-editor-bubble', {
      theme: 'bubble'
    });
  }

  if (select('.quill-editor-full')) {
    new Quill(".quill-editor-full", {
      modules: {
        toolbar: [
          [{
            font: []
          }, {
            size: []
          }],
          ["bold", "italic", "underline", "strike"],
          [{
              color: []
            },
            {
              background: []
            }
          ],
          [{
              script: "super"
            },
            {
              script: "sub"
            }
          ],
          [{
              list: "ordered"
            },
            {
              list: "bullet"
            },
            {
              indent: "-1"
            },
            {
              indent: "+1"
            }
          ],
          ["direction", {
            align: []
          }],
          ["link", "image", "video"],
          ["clean"]
        ]
      },
      theme: "snow"
    });
  }

  /**
   * Initiate TinyMCE Editor
   */

  const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

  tinymce.init({
    selector: 'textarea.tinymce-editor',
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
    editimage_cors_hosts: ['picsum.photos'],
    menubar: 'file edit view insert format tools table help',
    toolbar: "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    link_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_class_list: [{
        title: 'None',
        value: ''
      },
      {
        title: 'Some class',
        value: 'class-name'
      }
    ],
    importcss_append: true,
    file_picker_callback: (callback, value, meta) => {
      /* Provide file and text for the link dialog */
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', {
          text: 'My text'
        });
      }

      /* Provide image and alt text for the image dialog */
      if (meta.filetype === 'image') {
        callback('https://www.google.com/logos/google.jpg', {
          alt: 'My alt text'
        });
      }

      /* Provide alternative source and posted for the media dialog */
      if (meta.filetype === 'media') {
        callback('movie.mp4', {
          source2: 'alt.ogg',
          poster: 'https://www.google.com/logos/google.jpg'
        });
      }
    },
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: useDarkMode ? 'oxide-dark' : 'oxide',
    content_css: useDarkMode ? 'dark' : 'default',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
  });

  /**
   * Initiate Bootstrap validation check
   */
  var needsValidation = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(needsValidation)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })

  /**
   * Initiate Datatables
   */
  const datatables = select('.datatable', true)
  datatables.forEach(datatable => {
    new simpleDatatables.DataTable(datatable, {
      perPageSelect: [5, 10, 15, ["All", -1]],
      columns: [{
          select: 2,
          sortSequence: ["desc", "asc"]
        },
        {
          select: 3,
          sortSequence: ["desc"]
        },
        {
          select: 4,
          cellClass: "green",
          headerClass: "red"
        }
      ]
    });
  })

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();


///admin logic

document.querySelector('.dropdown-item.d-flex.align-items-center[href="#"]').addEventListener('click', (event) => {
  event.preventDefault();

  // Prompt the user to confirm logout
  const confirmLogout = confirm("Are you sure you want to log out?");
  
  if (confirmLogout) {
      // Call the logout endpoint to destroy the session
      fetch('/admin/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
      })
      .then(response => {
          if (response.ok) {
              // Display success message in green
              const successMessage = document.createElement('div');
              successMessage.textContent = 'Logout successful!';
              successMessage.style.color = 'green';
              successMessage.style.fontWeight = 'bold';
              successMessage.style.textAlign = 'center';
              successMessage.style.marginTop = '20px';
              document.body.prepend(successMessage);

              // Redirect to login page after logout
              setTimeout(() => {
                  window.location.href = '/admin.html';
              }, 2000); // Wait for 2 seconds before redirecting
          } else {
              return response.json().then(data => {
                  console.error('Logout failed:', data.error);
                  alert('Logout failed. Please try again.');
              });
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred during logout. Please try again.');
      });
  }
});

// Function to fetch and display the total doctor count
const updateDoctorCount = () => {
  fetch('/admin/doctors/count')
      .then(response => response.json())
      .then(data => {
          document.getElementById('doctor-count').textContent = data.totalDoctors;
      })
      .catch(error => console.error('Error fetching doctor count:', error));
};

// Call the function to update the doctor count on page load
document.addEventListener('DOMContentLoaded', updateDoctorCount);

// Function to fetch and display the total patient count
const updatePatientCount = () => {
  fetch('/admin/patients/count')
      .then(response => response.json())
      .then(data => {
          document.getElementById('patient-count').textContent = data.totalPatients;
      })
      .catch(error => console.error('Error fetching patient count:', error));
};

// Call the function to update the patient count on page load
document.addEventListener('DOMContentLoaded', updatePatientCount);


// Function to fetch and display total scheduled and canceled appointments
const updateAppointmentCounts = () => {
  fetch('/admin/appointments/count')
      .then(response => response.json())
      .then(data => {
          // Update scheduled appointments count
          document.getElementById('total-scheduled').textContent = data.totalScheduled;
          document.getElementById('scheduled-increase').textContent = `${data.scheduledIncrease}%`;

          // Update canceled appointments count
          document.getElementById('total-cancelled').textContent = data.totalCancelled;
          document.getElementById('cancelled-increase').textContent = `${data.cancelledIncrease}%`;
      })
      .catch(error => console.error('Error fetching appointment counts:', error));
};

// Call the function to update appointment counts on page load
document.addEventListener('DOMContentLoaded', updateAppointmentCounts);


//doctors
document.addEventListener('DOMContentLoaded', function () {
  // Fetch and display the doctor list
  function fetchDoctorList() {
      fetch('/admin/doctors')  // Assuming GET route to fetch doctor list
          .then(response => response.json())
          .then(data => {
              const tbody = document.querySelector('#doctor-list tbody');
              tbody.innerHTML = ''; // Clear the existing table content
              data.doctors.forEach(doctor => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${doctor.id}</td>
                      <td>${doctor.first_name}</td>
                      <td>${doctor.last_name}</td>
                      <td>${doctor.specialization}</td>
                      <td>${doctor.email}</td>
                      <td>${doctor.phone}</td>
                      <td>${doctor.schedule}</td>
                      <td>
                          <button class="btn btn-info btn-sm" onclick="editDoctor(${doctor.id})">Edit</button>
                          <hr>
                          <button class="btn btn-danger btn-sm" onclick="deleteDoctor(${doctor.id})">Delete</button>
                      </td>
                  `;
                  tbody.appendChild(row);
              });
          })
          .catch(error => console.error('Error fetching doctor list:', error));
  }

  // Handle form submission to add a new doctor
  document.getElementById('addDoctorForm').addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent form from submitting normally

      const doctorData = {
          first_name: document.getElementById('first_name').value,
          last_name: document.getElementById('last_name').value,
          specialization: document.getElementById('specialization').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          schedule: document.getElementById('schedule').value
      };

      fetch('/admin/doctors', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(doctorData)
      })
      .then(response => response.json())
      .then(data => {
          alert(data.message); // Show success message
          fetchDoctorList();  // Refresh doctor list
          document.getElementById('addDoctorForm').reset();  // Reset the form
      })
      .catch(error => console.error('Error adding doctor:', error));
  });

 
  // Initially load the doctor list
  fetchDoctorList();
});

document.addEventListener("DOMContentLoaded", function () {
  // Fetch appointments when the page loads
  fetchAppointments();

  // Function to fetch appointments for the admin
  function fetchAppointments() {
      fetch('/admin/appointments/') // Assuming the /appointments route is set up on the backend
          .then(response => {
              if (!response.ok) {
                  throw new Error('Error fetching appointments.');
              }
              return response.json();
          })
          .then(data => {
              const appointmentsTableBody = document.querySelector("#appointmentsTable tbody");
              appointmentsTableBody.innerHTML = ''; // Clear any existing rows

              // Loop through the fetched appointments and append rows to the table
              data.forEach(appointment => {
                  const row = document.createElement('tr');

                  row.innerHTML = `
                      <td>${appointment.id}</td>
                      <td>${appointment.patient_first_name}</td>
                      <td>${appointment.patient_last_name}</td>
                      <td>${appointment.appointment_date}</td>
                      <td>${appointment.appointment_time}</td>
                      <td>${appointment.status}</td>
                      <td>${appointment.doctor_first_name} ${appointment.doctor_last_name}</td>
                      <td>${appointment.specialization}</td>
                  `;

                  appointmentsTableBody.appendChild(row);
              });
          })
          .catch(error => {
              console.error('Error fetching appointments:', error);
          });
  }
});


function editDoctor(id) {
  fetch(`/admin/doctors/${id}`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          document.getElementById('edit_first_name').value = data.doctor.first_name;
          document.getElementById('edit_last_name').value = data.doctor.last_name;
          document.getElementById('edit_specialization').value = data.doctor.specialization;
          document.getElementById('edit_email').value = data.doctor.email;
          document.getElementById('edit_phone').value = data.doctor.phone;
          document.getElementById('edit_schedule').value = data.doctor.schedule;

          new bootstrap.Modal(document.getElementById('editDoctorModal')).show();

          document.getElementById('editDoctorForm').onsubmit = function (event) {
              event.preventDefault();

              const updatedDoctorData = {
                  first_name: document.getElementById('edit_first_name').value,
                  last_name: document.getElementById('edit_last_name').value,
                  specialization: document.getElementById('edit_specialization').value,
                  email: document.getElementById('edit_email').value,
                  phone: document.getElementById('edit_phone').value,
                  schedule: document.getElementById('edit_schedule').value
              };

              fetch(`/admin/doctors/${id}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(updatedDoctorData)
              })
              .then(response => response.json())
              .then(data => {
                  alert(data.message);
                  fetchDoctorList();  // Refresh doctor list
                  bootstrap.Modal.getInstance(document.getElementById('editDoctorModal')).hide();
              })
              .catch(error => console.error('Error updating doctor:', error));
          };
      })
      .catch(error => console.error('Error fetching doctor details:', error));
}

// Delete a doctor
function deleteDoctor(id) {
  // Show the delete confirmation modal
  new bootstrap.Modal(document.getElementById('deleteDoctorModal')).show();

  // Set up delete confirmation
  document.getElementById('confirmDeleteButton').onclick = function () {
      fetch(`/admin/doctors/${id}`, {
          method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
          alert(data.message);
          fetchDoctorList();  // Refresh doctor list
          bootstrap.Modal.getInstance(document.getElementById('deleteDoctorModal')).hide();
      })
      .catch(error => console.error('Error deleting doctor:', error));
  };
}

//patients
document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch patients data
  function fetchPatients() {
      fetch('/admin/patients')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to load patients data');
              }
              return response.json();
          })
          .then(data => {
              const patientsTableBody = document.querySelector("#patientsTable tbody");
              patientsTableBody.innerHTML = ''; // Clear any existing rows

              // Loop through each patient and append rows to the table
              data.forEach(patient => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${patient.id}</td>
                      <td>${patient.first_name}</td>
                      <td>${patient.last_name}</td>
                      <td>${patient.email}</td>
                      <td>${patient.phone}</td>
                      <td>${patient.address}</td>
                      <td>${patient.date_of_birth}</td>
                  `;
                  patientsTableBody.appendChild(row);
              });
          })
          .catch(error => {
              console.error('Error fetching patients:', error);
          });
  }

  // Call fetchPatients to load data when the page loads
  fetchPatients();
});


//search
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('searchQuery').value;

  fetch(`/admin/search-patients?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
          const patientsTableBody = document.querySelector("#patientsTable tbody");
          patientsTableBody.innerHTML = ''; // Clear existing rows

          data.forEach(patient => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${patient.id}</td>
                  <td>${patient.first_name}</td>
                  <td>${patient.last_name}</td>
                  <td>${patient.email}</td>
                  <td>${patient.phone}</td>
                  <td>${patient.address}</td>
                  <td>${patient.dob}</td>
              `;
              patientsTableBody.appendChild(row);
          });
      })
      .catch(error => {
          console.error('Error fetching patients:', error);
      });
});

document.addEventListener('DOMContentLoaded', function () {
  const doctorSearchForm = document.getElementById('doctorSearchForm');
  if (doctorSearchForm) {
      doctorSearchForm.addEventListener('submit', function (e) {
          e.preventDefault(); // Prevent the default form submission
          searchDoctors(); // Call the searchDoctors function
      });
  }
});

function searchDoctors() {
    const query = document.getElementById('doctorSearchQuery').value;

    fetch(`/admin/search-doctors?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const doctorTableBody = document.querySelector("#doctorTable tbody");
            doctorTableBody.innerHTML = ''; // Clear any existing rows

            data.forEach(doctor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doctor.id}</td>
                    <td>${doctor.first_name}</td>
                    <td>${doctor.last_name}</td>
                    <td>${doctor.specialization}</td>
                    <td>${doctor.email}</td>
                    <td>${doctor.phone}</td>
                    <td>${doctor.schedule || 'N/A'}</td>
                `;
                doctorTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching doctors:', error);
        });
}

