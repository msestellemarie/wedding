# Schemas

    {
        family: true,
        diatary: '',
        people: [
            {
                name: 'Tom Troyk',
                email: '...',
                attending: true
            },
            {
                name: 'Laura Troyk',
                email: '...',
                attending: false
            },
            {
                name: 'Kayla Troyk',
                email: '...',
                attending: null
            }
        ]
    }

    {
        family: false,
        diatary: undefined,
        people: [
            {
                name: 'Daryl Williams',
                email: '...',
                attending: null
            },
            {
                name: null,
                attending: null
            }
        ]
    }


# Emails:

- On RSVP/update, email RSVPer
- On RSVP/update, email us

# Endpoints:

- find (GET /api/rsvp)
- update (PUT /api/rsvp)
