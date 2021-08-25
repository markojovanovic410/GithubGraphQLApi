const columns=[
    {
       title:'Name',
       dataIndex:'name',
       key:'name',
       sorter: (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name),
       width:'60%',
       render:(url:string)=> (
        <a href={`https://github.com/${url}`}> 
            {url} 
        </a>
       ),
    },
    {
        title:'Stars',
        dataIndex:'stars',
        key:'stars',
        sorter: (a:{stars:number}, b:{stars:number})=>a.stars-b.stars,
    },
    {
        title:'Forks',
        dataIndex:'forks',
        key:'forks',
        sorter: (a:{forks:number}, b:{forks:number})=>a.forks-b.forks,
    }
];

export default columns;