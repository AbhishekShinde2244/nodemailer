//add more client button
function addClient() {
  const container = document.getElementById('client-inputs');
  const row = document.createElement('div');
  row.className = 'input-group';
  row.innerHTML = `
<input type="text" name="client_name[]" placeholder="Client Name" class="client-name mb-0 newInput">
<input type="email" name="client_email[]" placeholder="Client email address" class="client-email mb-0 newInput">
<svg id="fi_4436695" onclick="removeRow(this)" enable-background="new 0 0 512 512" height="70" viewBox="0 0 512 512" width="70" xmlns="http://www.w3.org/2000/svg"><g clip-rule="evenodd" fill-rule="evenodd"><path d="m256 0c-141.2 0-256 114.8-256 256s114.8 256 256 256 256-114.8 256-256-114.8-256-256-256z" fill="#f34235"></path><path d="m384.5 256c0 8.8-7.2 16-16 16h-225c-8.8 0-16-7.2-16-16s7.2-16 16-16h225c8.8 0 16 7.1 16 16z" fill="#fff"></path></g></svg>
<svg id="fi_3596215" class="eye-icon" enable-background="new 0 0 24 24" height="70" viewBox="0 0 24 24" width="70" xmlns="http://www.w3.org/2000/svg"><g><path d="m.5 7c-.276 0-.5-.224-.5-.5v-2c0-1.378 1.121-2.5 2.5-2.5h2c.276 0 .5.224.5.5s-.224.5-.5.5h-2c-.827 0-1.5.673-1.5 1.5v2c0 .276-.224.5-.5.5z"></path></g><g><path d="m23.5 7c-.276 0-.5-.224-.5-.5v-2c0-.827-.673-1.5-1.5-1.5h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c1.379 0 2.5 1.122 2.5 2.5v2c0 .276-.224.5-.5.5z"></path></g><g><path d="m4.5 22h-2c-1.379 0-2.5-1.122-2.5-2.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v2c0 .827.673 1.5 1.5 1.5h2c.276 0 .5.224.5.5s-.224.5-.5.5z"></path></g><g><path d="m21.5 22h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c.827 0 1.5-.673 1.5-1.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v2c0 1.378-1.121 2.5-2.5 2.5z"></path></g><g><path d="m12 18c-3.853 0-7.136-2.418-7.985-5.881-.02-.078-.02-.16 0-.238.849-3.463 4.132-5.881 7.985-5.881s7.136 2.418 7.985 5.881c.02.078.02.16 0 .238-.849 3.463-4.132 5.881-7.985 5.881zm-6.984-6c.786 2.95 3.639 5 6.984 5s6.198-2.05 6.984-5c-.786-2.95-3.638-5-6.984-5s-6.198 2.05-6.984 5z"></path></g><g><path d="m12 15c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm0-5c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"></path></g></svg>

`;
  container.appendChild(row);
}

function removeRow(button) {
  const row = button.parentElement;
  row.remove();
}



//send mail script

$("#sendmail").click(function (e) {
e.preventDefault(); //  This prevents form refresh

const sender = $('#sender').val();
const title = $('#title').val();
const admin = userid; // assuming defined globally
const auth = password;

if (!sender || !title) {
alert("âš ï¸ Please fill all required fields before sending.");
return;
}

const clientNames = $('.client-name').map(function () {
return $(this).val();
}).get();

const clientEmails = $('.client-email').map(function () {
return $(this).val();
}).get();

if (clientNames.length === 0 || clientEmails.length === 0 || clientNames.includes('') || clientEmails.includes('')) {
alert("âš ï¸ Please make sure all client names and emails are filled.");
return;
}

const recipients = clientNames.map((name, index) => ({
clientName: name,
email: clientEmails[index]
}));


const cc = Array.from(document.querySelectorAll('#ccContainer .chip')).map(chip => chip.childNodes[0].nodeValue.trim());

$("div.spanner").addClass("show");
$("div.overlay").addClass("show");

Promise.all(recipients.map(recipient => {
return fetch('http://localhost:3000/send', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
clientName: recipient.clientName,
sendername: sender,
desg: title,
email: recipient.email,
admin: admin,
auth: auth,
cc:cc,
})
});
}))
.then(responses => {
if (responses.some(res => !res.ok)) throw new Error("Some emails failed.");
return Promise.all(responses.map(res => res.text()));
})
.then(results => {
Swal.fire({
icon: 'success',
title: 'Mail Sent!',
text: 'Your email was sent successfully.',
confirmButtonColor: '#3085d6',
confirmButtonText: 'OK'
});
})
.catch(error => {
console.error("Error:", error);
alert("âŒ One or more emails failed to send.");
})
.finally(() => {
$("div.spanner").removeClass("show");
$("div.overlay").removeClass("show");
});
});




//auth script
var client = '';
var userid = '';
var password = '';

function validateLogin() {

client = document.getElementById('clientauth').value.trim();
userid = document.getElementById('userid').value.trim();
password = document.getElementById('password').value.trim();

let noSpaces = password .replace(/\s+/g, '');
password = noSpaces;

var VALID_CLIENT = "suma";

client = client.toLowerCase();
console.log(userid,password,client);
if (client === VALID_CLIENT && userid && password) {
// Send credentials to server for Gmail App Password verification
fetch('https://mailer-backend.sumasoft.com/auth', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email: userid, appPassword: password })
})
.then(function(res) {
return res.json();
})
.then(function(data) {
if (data.success) {
Swal.fire({
title: 'Success!',
text: 'Gmail Auth Successful',
imageUrl: '/success.gif',
imageWidth: 100,
imageHeight: 100,
imageAlt: 'Success Image'
});

// Create user file if not already present
fetch('https://mailer-backend.sumasoft.com/create-user-file', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ userid: userid })
})
.then(res => res.json())
.then(response => {
console.log(response.message); // Optional: log file creation status
})
.catch(err => console.error("File creation error:", err));

//   alert("âœ… ");
localStorage.setItem('user_id',userid);
localStorage.setItem('pass',password);

isLoggedIn=true;
document.getElementById('loginOverlay').style.display = "none";
$('.body').css('display','block');
} else {

alert("âŒ Gmail Auth Failed");
$('.loginBox h2').css('color','red');
}
})
.catch(function(error) {
console.error("Error:", error);
alert("âš ï¸ An error occurred during authentication.");
});

} else {
alert("âŒ Invalid client or blank fields");
      $('.loginBox h2').css('color','red');

}
}



// Handle eye icon preview click
$(document).on('click', '.eye-icon', function () {
const $group = $(this).closest('.input-group');
const clientName = $group.find('.client-name').val();
const clientEmail = $group.find('.client-email').val();

$('#clentname').text(clientName);  // Assuming class is .clientname, fix if it's .clentname
// $('.clientemail').text(clientEmail); // Optional if needed
});

// Live update sender name preview
$(document).on('keyup', '#sender', function () {

const senderName = $(this).val();
$('#SenderName').text(senderName);
});

// Live update title preview
$(document).on('keyup', '#title', function () {
const title = $(this).val();
$('#titlemanager').text(title);
});

$(document).on('click', '.showpassword', function () {
const $passwordInput = $('#password');
const isPasswordHidden = $passwordInput.attr('type') === 'password';

// Toggle password type
$passwordInput.attr('type', isPasswordHidden ? 'text' : 'password');

// Toggle icons
$('#fi_2767146').toggle(!isPasswordHidden); // hide icon
$('#fi_709612').toggle(isPasswordHidden);  // show icon
});


$(document).on('click', '.btn-logout', function () {
localStorage.removeItem('user_id');
localStorage.removeItem('pass');
$('#loginOverlay').css('display','flex');
});



$(document).ready(function(){
if(localStorage.getItem('user_id')){
$('#loginOverlay').css('display','none');
userid = localStorage.getItem('user_id');
password= localStorage.getItem('pass');
}
})


// Chips in Cc

let suggestionsFetched = false;
const ccInput = document.getElementById('ccInput');
const ccContainer = document.getElementById('ccContainer');

ccInput.addEventListener('input', function () {
  if (!suggestionsFetched) {
    fetch('http://localhost:3000/email-suggestions')
      .then(res => res.json())
      .then(data => {
        const datalist = document.getElementById('ccSuggestions');
        if (datalist) {
          datalist.innerHTML = '';
          data.forEach(email => {
            const option = document.createElement('option');
            option.value = email;
            datalist.appendChild(option);
          });
        }
        suggestionsFetched = true;
      });
  }
});

function validateEmail(email) {
  // Simple email validation
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

document.getElementById('uploadCcCsvBtn').addEventListener('click', function() {
  const fileInput = document.getElementById('ccCsvUpload');
  const ccInput = document.getElementById('ccInput');
  const ccContainer = document.getElementById('ccContainer');
  if (!fileInput.files.length) {
    alert('Please select a CSV file.');
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    // Split by comma or newline
    let emails = text.split(/,|\n/).map(e => e.trim()).filter(Boolean);
    emails.forEach(email => {
      if (!validateEmail(email)) {
        alert('Invalid email in CSV: ' + email);
        return;
      }
      // Prevent duplicates
      const existing = Array.from(ccContainer.querySelectorAll('.chip')).some(
        chip => chip.childNodes[0].nodeValue.trim() === email
      );
      if (!existing) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `${email} <span onclick="this.parentElement.remove()">×</span>`;
        ccContainer.insertBefore(chip, ccInput);
      }
    });
  };
  reader.readAsText(file);
});