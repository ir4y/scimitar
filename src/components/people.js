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

const model = (props) => {
    console.log(`i am funciton from props:${_.keys(props)}`);
    return {
        tree: {
            people: getPeople,
        },
    };
};

function People(props) {
    const people = props.tree.people;
    const status = people.status.get();
    if (status === 'Loading') {
        return <h3>Loading</h3>;
    }
    if (status === 'Failure') {
        return (
            <div>
                <h3>Error</h3>
                <p>{people.error.get()}</p>
            </div>
        );
    }
    return (
        <div>
            <ul>
                {_.map(people.data.results.get(), (person) =>
                    (<li key={person.url}>{person.name}</li>)
                )}
            </ul>
            <p>
                {
                    people.data.previous.get()
                    ?
                        <button onClick={() => getPeople(people, people.data.previous.get())}>
                            previous
                        </button>
                    :
                        null
                }
                {
                    people.data.next.get()
                    ?
                        <button onClick={() => getPeople(people, people.data.next.get())}>
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
