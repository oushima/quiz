// Request the student ID from the database.
export const requestStudent = studentId => {
	// Creates an instance of XMLHttpRequest (AJAX)
	const objectRequest = new XMLHttpRequest()
	
	// Specifies how we want to send the data request to the server (asynchronous request).
	objectRequest.open("GET", `https://quiz.clow.nl/v1/student/${studentId}`, true)
	
	// Sends the request.
	objectRequest.send()
	
	// Event listener that checks when the XMLHttpRequest changes (the readyState property).
	return new Promise((requestFound, requestNotFound) => {
		objectRequest.onreadystatechange = () => {
			// If the readyState of the current XMLHttpRequest is DONE and the response is OK continue...
			if (objectRequest.readyState === objectRequest.DONE && objectRequest.status === 200) {
				requestFound(JSON.parse(objectRequest.responseText))
			}
			else if (objectRequest.status !== 200) requestNotFound('Studentnummer komt niet voor in de database.')
		}
	})
}

export const setPlayerInformation = (studentObject) => {
		// Remove weird characters from name (my fetched student object has a period behind the name, that's why.)
		const firstName = studentObject.firstName.match(/[A-z]+/)
		const lastName = studentObject.lastName.match(/[A-z]+/)
		document.getElementById('first-name').value = firstName[0]
		document.getElementById('last-name').value = lastName[0]
		document.getElementById('player').innerHTML = `${studentObject.firstName} ${studentObject.lastName} speelt momenteel de quiz!`
	}