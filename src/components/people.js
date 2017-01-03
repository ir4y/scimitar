import React from 'react';
import _ from 'lodash';
import schema from '../libs/state';

async function getPeople(cursor, url = 'http://swapi.co/api/people/') {
    cursor.set({ status: 'Loading' });

    try {
        let response = await fetch(url);
        let data = await response.json();
        cursor.set({
            data,
            status: 'Succeed',
        });
    } catch (error) {
        cursor.set({
            error,
            status: 'Failure',
        });
    }
}

const model = {
    people: getPeople,
};

function People(props) {
    const people = props.cursors.people;
    if (people.status === 'Loading') {
        return <h3>Loading</h3>;
    }
    if (people.status === 'Failure') {
        return (
            <div>
                <h3>Error</h3>
                <p>{people.error}</p>
            </div>
        );
    }
    return (
        <div>
            <ul>
                {_.map(people.data.results, (person) =>
                    (<li key={person.url}>{person.name}</li>)
                )}
            </ul>
            <p>
                {
                        people.data.previous
                    ?
                        <button onClick={() => getPeople(props.cursors.peopleCursor, people.data.previous)}>
                            previous
                        </button>
                    :
                        null
                }
                {
                        people.data.next
                    ?
                        <button onClick={() => getPeople(props.cursors.peopleCursor, people.data.next)}>
                            next
                        </button>
                    :
                        null
                }

            </p>
        </div>
    );
}

People.displayName = 'People';

export default schema(model)(People);
