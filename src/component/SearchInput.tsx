import { Row, Col, Input} from 'antd';
const {Search} = Input;

function SearchInput(props:any){
    return(
        <Row justify='center' style={{marginBottom:"20px"}} key='search'>            
            <Col span={8}>
                <Search placeholder="Input search text"  enterButton="Search" size="large" 
                    onSearch={props.searchData} onChange={(e)=>props.setSearchText(e.target.value)} value={props.searchText}/>
            </Col>
        </Row>
    );
}

export default SearchInput;
