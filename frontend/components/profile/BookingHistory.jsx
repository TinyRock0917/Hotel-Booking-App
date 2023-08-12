/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import {
  Button, Rate, Result, Space, Table, Tag, Tooltip
} from 'antd';
import Link from 'next/link';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import arrayToCommaSeparatedText from '../../utils/arrayToCommaSeparatedText';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';

function BookingHistory() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [filter, setFilter] = useState({
    page: 1, limit: 10, sort: 'desc'
  });

  // fetch user booking history API data
  const [loading, error, response] = useFetchData(`/api/v1/get-user-booking-orders?limit=${filter.limit}&page=${filter.page}&sort=${filter.sort}`, fetchAgain);

  return (
    <div>
      {error ? (
        <Result
          title='Failed to fetch'
          subTitle={error}
          status='500'
          extra={(
            <Button
              className='gradient-primary-btn'
              onClick={() => setFetchAgain(!fetchAgain)}
              type='primary'
              size='large'
              loading={loading}
              disabled={loading}
            >
              Try to Again
            </Button>
          )}
        />
      ) : (
        <Table
          className='h-[74vh] overflow-y-scroll'
          columns={[
            {
              key: 1,
              title: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Booking Dates
                  {filter.sort === 'asce'
                    ? (<SortAscendingOutlined />)
                    : (<SortDescendingOutlined />)}
                </div>
              ),
              dataIndex: 'booking_dates',
              render: (data) => (
                arrayToCommaSeparatedText(data?.map(
                  (date) => (date.split('T')[0])
                ))
              ),
              sorter: true,
              sortOrder: filter.sort,
              align: 'left'
            },
            {
              key: 2,
              title: 'Booking Room',
              dataIndex: 'room',
              render: (data) => (
                <Link href={`/rooms/${data?.room_slug}`} target='_blank'>
                  <Button
                    className='btn-primary'
                    size='large'
                    type='link'
                  >
                    {data?.room_name || 'N/A'}
                  </Button>
                </Link>
              ),
              align: 'center'
            },
            {
              key: 3,
              title: 'Booking Status',
              dataIndex: 'booking_status',
              render: (data) => (
                <Tag color={bookingStatusAsResponse(data).color}>
                  {bookingStatusAsResponse(data).level}
                </Tag>
              ),
              align: 'center'
            },
            {
              key: 4,
              title: 'Review & Ratting',
              dataIndex: 'reviews',
              render: (data) => (
                <span>
                  {data ? (
                    <Tooltip
                      title={data?.message}
                      placement='top'
                      trigger='hover'
                    >
                      <Rate value={data?.rating} disabled />
                    </Tooltip>
                  ) : 'N/A'}
                </span>
              ),
              align: 'center'
            },
            {
              key: 5,
              title: 'Actions',
              dataIndex: 'actions',
              render: (_, record) => (
                <Space size='middle'>
                  {record?.booking_status === 'pending' && (
                    <Button
                      className='w-[85px]'
                      type='default'
                      size='middle'
                      danger
                    >
                      Cancel Booking
                    </Button>
                  )}

                  {record?.booking_status === 'in-reviews' && (
                    <Button
                      className='w-[85px]'
                      type='default'
                      size='middle'
                      // onClick={() => setAddReviewModal(
                      //   (prevState) => ({ ...prevState, open: true, data: record })
                      // )}
                    >
                      Add Reviews
                    </Button>
                  )}

                  {(record?.booking_status === 'rejected' || record?.booking_status === 'approved' || record?.booking_status === 'completed') && 'Action Not Possible!'}
                </Space>
              ),
              align: 'center'
            }
          ]}
          dataSource={response?.data?.rows}
          pagination={{
            // pagination
            total: response?.data?.total_page,
            current: response?.data?.current_page,
            hideOnSinglePage: false,
            onChange: (data) => setFilter((prevSate) => ({ ...prevSate, page: data })),
            // limit
            defaultPageSize: filter?.limit,
            pageSize: response?.result?.limit,
            pageSizeOptions: [5, 10, 20, 30, 40, 50, 100],
            showSizeChanger: true,
            onShowSizeChange: (_, num) => setFilter((prevSate) => ({ ...prevSate, limit: num })),
            // settings
            position: ['bottomCenter']
          }}
          // sort
          sortDirections={['asce', 'desc']}
          onChange={(_, __, sorter) => setFilter(
            (prevSate) => ({ ...prevSate, sort: sorter?.order || 'asce' })
          )}
          showSorterTooltip={false}
          loading={loading}
          rowKey='id'
          bordered
        />
      )}
    </div>
  );
}

export default BookingHistory;
