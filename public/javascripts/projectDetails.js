// delete team members
const removeMember = document.querySelectorAll('#remove');

removeMember.forEach(button => {
  button.addEventListener('click', (event) => {
    const action = 'remove';
    const memberId = event.target.value;
    const projectId = event.target.parentNode.parentNode.parentNode.title;

    const data = { action, memberId, projectId }

    let request = new Request(`/projects/${projectId}/team`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    fetch(request)
  })
})

// accept applicants
const acceptApplicant = document.querySelectorAll('#accept')

acceptApplicant.forEach(button => {
  button.addEventListener('click', (event) => {
    const action = 'accept';
    const memberId = event.target.value;
    const projectId = event.target.parentNode.parentNode.parentNode.parentNode.title;

    const data = { action, memberId, projectId }

    let request = new Request(`/projects/${projectId}/applicants`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    fetch(request)
  })
})

// reject applicants
const rejectApplicant = document.querySelectorAll('#reject')

rejectApplicant.forEach(button => {
  button.addEventListener('click', (event) => {
    const action = 'reject';
    const memberId = event.target.value;
    const projectId = event.target.parentNode.parentNode.parentNode.parentNode.title;

    const data = { action, memberId, projectId }

    let request = new Request(`/projects/${projectId}/applicants`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    fetch(request)
  })
})
