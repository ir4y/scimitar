import React from 'react';
import schema from '../libs/state';
import { guid } from '../libs/utils';

const model = {
    id: guid(),
    title: 'simple counter',
    value: 0,
};

function Counter(props) {
    const cursors = props.cursors;
    return (
        <div>
            <h3>{cursors.title}</h3>
            <button onClick={() => cursors.value += 1}>
                +
            </button>
            {cursors.value}
            <button onClick={() => cursors.value -= 1}>
                -
            </button>
        </div>
    );
}

export default schema(model)(Counter);
