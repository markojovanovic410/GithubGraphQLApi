import { Row, Col, Table} from 'antd';
import SearchInput from './SearchInput';
import columns from './Columns';
import {useState, useEffect} from 'react';
const fetch = require("node-fetch");

//this is my github.com token
//change this to your token
const token = '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';

function RepositoryTable(){
    const [searchText, setSearchText] = useState('');  //
    const [loading, setloading]=useState(false);        

    const [currentPage, setCurrentPage] = useState(0);  //current pagination number
    const [cursorInfos, setCursorInfos] = useState([]); //{start cursor, end cursor, flag} for GraphQL api.

    const [repoData, setRepoData] = useState([{         //Table Data
        key:0,
        name:'',
        stars:0,
        forks:0,
    }]);
    const [totalCount, setTotalCount] = useState(1);    //Table Total Row Count
    

    useEffect(() => {                
        requestApi(1);  
    }, []);
        

    const requestApi = async(pageNum:number) => {
        setloading(true);
        var subquery:String = '' ;
        var queryFlag = 0;
        var t:number = (pageNum - pageNum%10)/10;
        //generate subquery

        /*
            You can get max 100 rows vai Github GraphQL Api
            so need to generate subquery with cursor info.            
        */
        if(currentPage === 0){
            subquery = 'first: 100';
        }
        else {
            if(cursorInfos[t] && cursorInfos[t]["flag"]){
                setloading(false);
                return;
            }
            if(t>0 && cursorInfos[t-1] && cursorInfos[t-1]["flag"]){
                subquery = 'first: 100, after:"'+cursorInfos[t-1]["end"]+'"';
            }
            else if(t>0 && cursorInfos[t+1] && cursorInfos[t+1]["flag"]){
                subquery = 'last: 100, before:"'+cursorInfos[t+1]["start"]+'"';
                queryFlag = 1;
            }
            else {
                subquery = 'last: '+totalCount%100;
                queryFlag = 2;
            }
        }
        var str = '';
        if(searchText !== '') str = ' '+searchText;
        //make grapql query
        const query = `{
            search(query: "react`+str+`", type: REPOSITORY, `+subquery+`) {
                repositoryCount
                pageInfo {
                    endCursor
                    startCursor
                }
                edges {
                    node {
                        ... on Repository {
                            name
                            stargazerCount
                            forkCount
                            owner{
                              login
                            }
                        }
                        
                    }
                }
            }
        }`;
    
        //request api
        await fetch('https://api.github.com/graphql', {
            method: 'POST',
            body: JSON.stringify({query}),
            headers: {
            'Authorization': `Bearer ${token}`,
            }
        })
        .then((res:any) => res.text())
        .then((body:any) => {
            const result = JSON.parse(body);
            if(result.data.search.edges){
                setTotalCount(result.data.search.repositoryCount);
                setCurrentPage(pageNum);
                var tmpCursorInfos:any = cursorInfos;
                tmpCursorInfos[t] = {flag:true, start: result.data.search.pageInfo.startCursor, end: result.data.search.pageInfo.endCursor};
                setCursorInfos(tmpCursorInfos);
                const data = result.data.search.edges;
                let tmpRepoData:any = repoData;
                data.forEach(function(currentValue:any, index:any){
                    var keyId = index;
                    if(queryFlag === 0)    {
                        keyId = t*100 + index;
                    }
                    else if(queryFlag === 1){
                        keyId = (t+1)*100 - index - 1;
                    }
                    else if(queryFlag === 2){
                        keyId = totalCount -index - 1;
                    }
                    let tmp= {
                        key: keyId,
                        name: currentValue['node']['owner']['login']+'/'+currentValue['node']['name'],
                        stars: currentValue['node']['stargazerCount'],
                        forks: currentValue['node']['forkCount'],
                    };

                    tmpRepoData[keyId] = tmp;
                });
                
                let newData = tmpRepoData.map((d:any)=>({...d}));
                setRepoData(newData);
                setloading(false);
            }
        })
        .catch((error:any) => console.error(error));
    }

    const searchData = (e:any) => {
        setCurrentPage(0);
        setCursorInfos([]);
        setRepoData([{
            key:0,
            name:'',
            stars:0,
            forks:0,
        }]);
        setTotalCount(1);
        requestApi(1);
    }

    const handleTableChange = (pagination:any, filters:any, sorter:any) => {
        requestApi(pagination.current);
    }

    return(
        <div>
            <SearchInput searchText={searchText} setSearchText={setSearchText} searchData={searchData} />
            <Row justify='center' key='content'>
                <Col span={20}>
                    <Table columns={columns} dataSource = {repoData} loading={loading}
                     pagination={{total: totalCount, showSizeChanger:false}} onChange={handleTableChange} />
                </Col>
            </Row>
        </div>
    );
}

export default RepositoryTable;