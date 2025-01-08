import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import {
  IconButton,
  ListItemIcon,
  TableFooter,
  Menu,
  MenuItem,
} from "@mui/material";
import { MdOutlineEdit, MdOutlineMoreVert } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { GrView } from "react-icons/gr";

interface ColumnConfig<T> {
  field: keyof T;
  headerName: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  customRender?: (row: T) => React.ReactNode;
}

interface CustomTableProps<T> {
  tableConfig?: any;
  isLoading?: boolean;
  fixRow?: boolean;
  pagination?: any
}

export default function CustomTable<T>({
  tableConfig,
  isLoading,
  pagination
}: CustomTableProps<T>) {
  const { columns, rows, handlePagination, fixRow, handleRowLimit } =
    tableConfig;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [menuKey, setMenuKey] = React.useState(null);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuKey: any
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuKey(menuKey);
  };

  const handleClose = (type: any, item: any) => {
    tableConfig.onActionClick(type, item);
    setAnchorEl(null);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    if (fixRow) {
      handlePagination(newPage);
    }
    setPage(newPage);
  };

  const updatedColumns = [...tableConfig.columns];
  if (tableConfig.actionPresent) {
    updatedColumns.push({
      field: "action",
      headerName: "Action",
    });
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", background: "none" }}>
      <TableContainer
        sx={{ 
            // maxHeight: 440,
            border: '2px solid #403a6b',
            borderRadius: '8px'
         }}
        className="custom-scrollbar"
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#342d5f" }}>
              {updatedColumns.map((column: any) => (
                <TableCell
                  key={column.field}
                  sx={{
                    // fontFamily: "Montserrat, sans-serif",
                    color: "#7067aa",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderBottom: '2px solid #403a6b',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow sx={{ background: "#342d5f" }}>
                <TableCell
                  colSpan={tableConfig.columns.length}
                  align="center"
                  sx={{ height: "200px", position: "relative", borderBottom: '2px solid #403a6b',
                   }}
                >
                  {/* <Loader show={true} sx={{ position: "absolute" }} /> */}
                </TableCell>
              </TableRow>
            ) : tableConfig?.rows?.length === 0 ? (
              <TableRow sx={{ background: "#342d5f" }}>
                <TableCell
                  colSpan={tableConfig.columns.length}
                  align="center"
                  sx={{
                    fontSize: "20px",
                    fontWeight: 400,
                    height: "200px",
                    color: "#7067aa",
                    border: '#403a6b'
                  }}
                >
                  {tableConfig.notFoundData}
                </TableCell>
              </TableRow>
            ) : (
              (fixRow
                ? rows
                : rows?.slice((page - 1) * rowsPerPage, page * rowsPerPage)
              ).map((row: any, index: number) => (
                <TableRow key={index} sx={{ background: "#342d5f" }}>
                  {updatedColumns.map((column: any) => {
                    const cellKey = `Datatable-row-${index}-${column.field}`;

                    if (
                      column.field === "action" &&
                      tableConfig.actionPresent
                    ) {
                      return (
                        <TableCell
                          key={cellKey}
                          sx={{
                            // fontFamily: "Montserrat, sans-serif",
                            fontSize: "14px",
                            color: "#7067aa",
                          }}
                        >
                          <IconButton
                            id="basic-button"
                            aria-controls={open ? "basic-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                            onClick={(event) => {
                              handleClick(event, cellKey);
                            }}
                          >
                            <MdOutlineMoreVert size={18} />
                          </IconButton>
                          <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open && menuKey === cellKey}
                            onClose={handleClose}
                            MenuListProps={{
                              "aria-labelledby": "basic-button",
                            }}
                          >
                            {tableConfig?.actionList?.includes("edit") && (
                              <MenuItem
                                onClick={() => {
                                  handleClose("edit", row);
                                }}
                              >
                                <ListItemIcon>
                                  <MdOutlineEdit size={18} />
                                </ListItemIcon>
                                Edit
                              </MenuItem>
                            )}
                            {tableConfig?.actionList?.includes("view") && (
                              <MenuItem
                                onClick={() => {
                                  handleClose("view", row);
                                }}
                              >
                                <ListItemIcon>
                                  <GrView size={18} />
                                </ListItemIcon>
                                View
                              </MenuItem>
                            )}
                            {tableConfig?.actionList?.includes("delete") && (
                              <MenuItem
                                onClick={() => {
                                  handleClose("delete", row);
                                }}
                              >
                                <ListItemIcon>
                                  <RiDeleteBinLine size={18} />
                                </ListItemIcon>
                                Delete
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      );
                    } else if (column.customRender) {
                      return (
                        <TableCell
                          key={cellKey}
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {column.customRender(row)}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell
                          key={cellKey}
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {row[column.field] ? row[column.field] : "-"}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
     {pagination && <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[]} // Hides the rows per page selector
      />}
    </Paper>
  );
}
