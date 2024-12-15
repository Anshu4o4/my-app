
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

interface DataRow {
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const App: React.FC = () => {
    
    const [data, setData] = useState<DataRow[]>([]);
    const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const overlayPanelRef = useRef<OverlayPanel>(null);

  
    const fetchPageData = async (page: number, rows: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks`, {
                params: { page, limit: rows },
            });

            const transformedData = response.data.data.map((item: any) => ({
                title: item.title || 'Unknown',
                place_of_origin: item.place_of_origin || 'Unknown',
                artist_display: item.artist_display || 'Unknown',
                inscriptions: item.inscriptions || 'N/A',
                date_start: item.date_start || 0,
                date_end: item.date_end || 0,
            }));

            setData(transformedData);
            setTotalRecords(response.data.pagination.total || 0);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        fetchPageData(page + 1, rowsPerPage);
    }, [page, rowsPerPage]);

    const onPageChange = (event: { page: number; rows: number }) => {
        setPage(event.page);
        setRowsPerPage(event.rows);
    };

    const onRowSelectChange = (e: { value: DataRow[] }) => {
        setSelectedRows(e.value);
    };

    const header = (
        <div className="table-header">
            <div className="header-left">
                <Button
                    type="button"
                    icon="pi pi-chevron-down"
                    label="Select Rows"
                    onClick={(e) => overlayPanelRef.current?.toggle(e)}
                    className="p-button-text"
                />
                <OverlayPanel ref={overlayPanelRef}>
                    <div>
                        <p>Enter the number of rows to display:</p>
                        <input
                            type="number"
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value) || 10)}
                        />
                    </div>
                </OverlayPanel>
            </div>
        </div>
    );

    return (
        <div className="app-container">
            <div className="card full-page">
                <h1 className="title">Artworks Data Table</h1>
                <DataTable
    value={data}
    paginator={true}  
    rows={rowsPerPage}
    loading={loading}
    header={header}
    selection={selectedRows}
    onSelectionChange={(e) => onRowSelectChange(e)}
    dataKey="title"
    className="custom-table"
    selectionMode="multiple"  
>
    <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
    <Column field="title" header="Title"></Column>
    <Column field="place_of_origin" header="Place of Origin"></Column>
    <Column field="artist_display" header="Artist"></Column>
    <Column field="inscriptions" header="Inscriptions"></Column>
    <Column field="date_start" header="Start Date"></Column>
    <Column field="date_end" header="End Date"></Column>
</DataTable>

                <Paginator
                    first={page * rowsPerPage}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};

export default App;
