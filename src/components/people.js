import React from 'react';
import _ from 'lodash';
import schema from '../libs/state';

const model = (props, context) => {
    return {
        tree: {
            people: context.services.peopleService,
        },
    };
};

function getExtraUrlParam(url) {
    return `?${url.split('?')[1]}`;
}

function People(props, context) {
    const people = props.tree.people;
    const status = people.status.get();
    const peopleService = context.services.peopleService;

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
                        <button onClick={() => peopleService(people, getExtraUrlParam(people.data.previous.get()))}>
                            previous
                        </button>
                    :
                        null
                }
                {
                    people.data.next.get()
                    ?
                        <button onClick={() => peopleService(people, getExtraUrlParam(people.data.next.get()))}>
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
People.contextTypes = {
    services: React.PropTypes.shape({
        peopleService: React.PropTypes.func.isRequired,
    }),
};

export default schema(model)(People);
