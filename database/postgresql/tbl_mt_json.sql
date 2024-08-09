CREATE TABLE tbl_mt_json(
	id BIGINT PRIMARY KEY
	, nm VARCHAR (50) NOT NULL
	, mt_http_method_id SMALLINT
	, notation VARCHAR (200)
	, is_del SMALLINT DEFAULT(0)
	, created_by VARCHAR (20)
	, dt_created TIMESTAMP
	, updated_by VARCHAR (20)
	, dt_updated TIMESTAMP
	, version SMALLINT DEFAULT(0)
);

INSERT INTO tbl_mt_json VALUES (1722808414267511, 'Start Work', 2, '/task/start-work.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808415179617, 'Stop Work', 2, '/task/stop-work.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808415987417, 'Dough Stock', 1, '/task/:date/dough-stock.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808415371517, 'Upsert Dough Stock', 2, '/task/dough-stock.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808416485611, 'Patch Dough Stock', 4, '/task/:id/dough-stock.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808416202418, 'Expense', 1, '/task/expense.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808416255311, 'Subordinate Expense', 1, '/task/subordinate-expense.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808417246417, 'Create Expense', 2, '/task/:branchId/expense.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);
INSERT INTO tbl_mt_json VALUES (1722808417595613, 'Patch Expense', 4, '/task/:id/expense.json', 0, 'system', '2024-08-04 00:00:00.0', NULL, NULL, 0);