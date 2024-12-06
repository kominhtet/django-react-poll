import React from 'react';
import { Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from 'reactstrap';
import PollList from './poll_list';
import api from '../../api'; // Adjust the import path based on your folder structure

class Sidebar extends React.Component {
    state = {
        categories: [],
        selectedCategory: null,
        dropdownOpen: false,
    };

    componentDidMount() {
        this.fetchCategories();
    }

    fetchCategories = async () => {
        try {
            const response = await api.get('poll-categories/'); // Fetch categories from API
            this.setState({ categories: response.data });
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    toggleDropdown = () => {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    };

    selectCategory = (category) => {
        this.setState({ selectedCategory: category });
    };

    render() {
        const { categories, selectedCategory, dropdownOpen } = this.state;

        return (
            <div style={{ background: '#efefef', padding: '10px' }}>
                <Row className="mb-3">
                    <Col xs={6} sm={6} md={7} className="mb-2 mb-md-0">
                        <Input
                            type="search"
                            placeholder="Search"
                            value={this.props.searchTerm}
                            onChange={(event) => this.props.handleSearch(event.target.value)}
                        />
                    </Col>
                    <Col xs={6} sm={6} md={5}>
                        <Dropdown isOpen={dropdownOpen} toggle={this.toggleDropdown}>
                            <DropdownToggle caret block>
                                {selectedCategory ? selectedCategory.name : 'All Categories'}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.selectCategory(null)}>
                                    All Categories
                                </DropdownItem>
                                {categories.map((category) => (
                                    <DropdownItem key={category.id} onClick={() => this.selectCategory(category)}>
                                        {category.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                </Row>

                <hr />

                {/* Pass searchTerm and selectedCategory as props to PollList */}
                <PollList
                    selectPoll={this.props.selectPoll}
                    searchTerm={this.props.searchTerm}
                    selectedCategory={selectedCategory ? selectedCategory.id : null}
                />
                
            </div>
        );
    }
}

export default Sidebar;
