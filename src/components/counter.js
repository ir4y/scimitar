import React from 'react';
import schema from '../libs/state';
import { guid } from '../libs/utils';

const model = {
    tree: {
        id: (c) => c.set(guid()),
        title: 'simple counter',
        value: 0,
    },
};

function Input({ cursor }) {
    return (
        <input value={cursor.get()} onChange={(event) => cursor.set(event.target.value)} />
    );
}

function Counter(props) {
    const counter = props.tree;
    console.log(`render counter#${counter.id.get()}`);
    return (
        <div>
            <h3>{counter.title.get()}</h3>
            <Input cursor={counter.title} />
            <button onClick={() => counter.value.apply((v) => v + 1)}>
                +
            </button>
            {counter.value.get()}
            <button onClick={() => counter.value.apply((v) => v - 1)}>
                -
            </button>
        </div>
    );
}

export default schema(model)(Counter);
