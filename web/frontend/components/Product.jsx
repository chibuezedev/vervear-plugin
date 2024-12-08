import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    Thumbnail,
    Page,
    Pagination,
    Tabs
  } from '@shopify/polaris';
  import React, { useState } from 'react';
  
export function SimpleIndexTableExample({ products, onUpdate }) {
    // const {selectedResources, allResourcesSelected, handleSelectionChange} =
    //   useIndexResourceState(orders);
    const itemsPerPage = 5; // Number of items to show per page
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (selectedTabIndex) => {
      setSelectedTab(selectedTabIndex);
      setCurrentPage(1); // Reset to the first page when switching tabs
    };

    const tabs = [
      { id: "all-products", content: "All", status: "all" },
      { id: "published-products", content: "Published", status: "published" },
      { id: "unpublished-products", content: "Unpublished", status: "unpublished" },
    ];

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handleNext = () => {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevious = () => {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const paginatedProducts = products.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


  
      const rowMarkup = paginatedProducts.map(({ id, title, image, hasARModel, status, created_at }, index) => {
        const media = (
          <Thumbnail source={image || "placeholder-image.png"} alt={title} />
        );
        const formattedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(created_at));
        return (
        
        <IndexTable.Row
          id={id}
          key={id}
          // selected={selectedResources.includes(id)}
          position={index}
          // selectable={false} // No checkbox for individual rows
        >
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {media}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{title}</IndexTable.Cell>
          <IndexTable.Cell>{status}</IndexTable.Cell>
          <IndexTable.Cell>
            {/* <Text as="span" alignment="center" numeric> */}
              {/* {hasARModel} */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 1C10.5511 1 10.3603 1.07902 10.2197 1.21967C10.079 1.36032 10 1.55109 10 1.75C10 1.94891 10.079 2.13968 10.2197 2.28033C10.3603 2.42098 10.5511 2.5 10.75 2.5H12.44L8.22 6.72C8.08752 6.86217 8.0154 7.05022 8.01882 7.24452C8.02225 7.43882 8.10097 7.62421 8.23838 7.76162C8.37579 7.89903 8.56118 7.97775 8.75548 7.98117C8.94978 7.9846 9.13783 7.91248 9.28 7.78L13.5 3.56V5.25C13.5 5.44891 13.579 5.63968 13.7197 5.78033C13.8603 5.92098 14.0511 6 14.25 6C14.4489 6 14.6397 5.92098 14.7803 5.78033C14.921 5.63968 15 5.44891 15 5.25V1H10.75ZM2.5 4V13C2.5 13.1326 2.55268 13.2598 2.64645 13.3536C2.74021 13.4473 2.86739 13.5 3 13.5H12C12.1326 13.5 12.2598 13.4473 12.3536 13.3536C12.4473 13.2598 12.5 13.1326 12.5 13V8.75C12.5 8.55109 12.579 8.36032 12.7197 8.21967C12.8603 8.07902 13.0511 8 13.25 8C13.4489 8 13.6397 8.07902 13.7803 8.21967C13.921 8.36032 14 8.55109 14 8.75V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H7.25C7.44891 2 7.63968 2.07902 7.78033 2.21967C7.92098 2.36032 8 2.55109 8 2.75C8 2.94891 7.92098 3.13968 7.78033 3.28033C7.63968 3.42098 7.44891 3.5 7.25 3.5H3C2.86739 3.5 2.74021 3.55268 2.64645 3.64645C2.55268 3.74021 2.5 3.86739 2.5 4Z" fill="black"/>
            </svg>
            {/* </Text> */}
          </IndexTable.Cell>
          <IndexTable.Cell>{formattedDate}</IndexTable.Cell>
          <IndexTable.Cell></IndexTable.Cell>
        </IndexTable.Row>
      )
    });

    return (
      <div style={{marginTop: 20, marginBottom: 20}}>
        <div style={{marginBottom: 20}}>
          <Text variant="heading2xl" as="h4">
                My 3D & AR Products
          </Text>
        </div>
      
      <LegacyCard>
        <IndexTable
          // resourceName={resourceName}
          itemCount={products.length}
          selectable={false} // Disable checkboxes
          // selectedItemsCount={
          //   allResourcesSelected ? 'All' : selectedResources.length
          // }
          // onSelectionChange={handleSelectionChange}
          headings={[
            {title: ''},
            {title: 'Product Name'},
            {title: 'Status'},
            {title: 'Preview 3D & AR'},
            {title: 'Date Created'},
            // {title: ''},
          ]}
        >
          {rowMarkup}
        </IndexTable>

        <div style={{ padding: "1rem", display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            hasPrevious={currentPage > 1}
            onPrevious={handlePrevious}
            hasNext={currentPage < totalPages}
            onNext={handleNext}
          />
        </div>
      </LegacyCard>
      </div>
    );
  }