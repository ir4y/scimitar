import React from 'react';
import schema from '../libs/state';
import { guid } from '../libs/utils';
import Counter, { model as counterModel } from './counter';

const model = {
    counters : [],
};

function CounterList(props) {
    const countersCursor = props.cursors.countersCursor;
    const newCounter = {id: guid(), ...counterModel};
    return (
        <div>
            {countersCursor.map((cursor) => (
                <Counter key={cursor.get('id')} tree={cursor} />
             ))}
            <button onClick={() => countersCursor.push(newCounter)}>+</button>
        </div>
    );
}

export default schema(model)(CounterList);
